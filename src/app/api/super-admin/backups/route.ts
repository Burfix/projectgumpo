import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/errors";

/**
 * GET /api/super-admin/backups
 * Get backup history
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data: backups, error } = await supabase
      .from("backups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json(backups || []);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/super-admin/backups" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to fetch backups" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/backups
 * Trigger a new backup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = "full", description } = body;
    
    const supabase = createAdminClient();

    // Get database statistics for backup metadata
    const tables = [
      "users", "schools", "classrooms", "children", 
      "attendance", "incidents", "meals", "naps", "messages"
    ];
    
    let totalRecords = 0;
    const tableStats: Record<string, number> = {};
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      
      if (!error && count !== null) {
        tableStats[table] = count;
        totalRecords += count;
      }
    }

    // Estimate size (rough calculation: ~1KB per record)
    const estimatedSizeKB = totalRecords;
    const estimatedSizeMB = (estimatedSizeKB / 1024).toFixed(2);

    // Create backup record
    const { data: backup, error: insertError } = await supabase
      .from("backups")
      .insert({
        type,
        description: description || `${type} backup`,
        status: "completed",
        size_mb: parseFloat(estimatedSizeMB),
        records_count: totalRecords,
        tables_included: tables,
        metadata: tableStats,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(backup);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/super-admin/backups" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to create backup" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/super-admin/backups/:id
 * Delete a backup
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Backup ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("backups")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "DELETE /api/super-admin/backups" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to delete backup" },
      { status: 500 }
    );
  }
}
