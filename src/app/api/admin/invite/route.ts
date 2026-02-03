import { NextResponse } from "next/server";
import { protectApiRoute } from "@/lib/auth/middleware";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidRole, type UserRole } from "@/lib/auth/rbac";

export async function POST(req: Request) {
  try {
    await protectApiRoute(["SUPER_ADMIN"]);

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const roleInput = String(body?.role ?? "PARENT").trim().toUpperCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const role = isValidRole(roleInput) ? (roleInput as UserRole) : "PARENT";

    const admin = createAdminClient();

    // Check invite count for this email
    const { data: existingInvites, error: countError } = await admin
      .from("invites")
      .select("count", { count: "exact" })
      .eq("email", email);

    const inviteCount = existingInvites?.length ?? 0;

    if (inviteCount >= 3) {
      return NextResponse.json(
        { error: `Maximum 3 invites allowed for ${email}. Limit reached.` },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://projectgumpo.space";

    const dashboardPath =
      role === "SUPER_ADMIN"
        ? "/dashboard/super-admin"
        : role === "ADMIN" || role === "PRINCIPAL"
          ? "/dashboard/admin"
          : role === "TEACHER"
            ? "/dashboard/teacher"
            : "/dashboard/parent";

    const nextPath = `/auth/reset-password?next=${encodeURIComponent(dashboardPath)}`;

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data?.user) {
      // Store invite in database
      await admin.from("invites").insert({
        email,
        role,
        user_id: data.user.id,
      });

      // Also upsert user record
      await admin
        .from("users")
        .upsert(
          {
            id: data.user.id,
            email,
            role,
          },
          { onConflict: "id" }
        );
    }

    return NextResponse.json({ ok: true, userId: data?.user?.id ?? null, inviteCount: inviteCount + 1 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Invite failed" },
      { status: 500 }
    );
  }
}
