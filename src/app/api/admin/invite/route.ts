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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://projectgumpo.space";

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: `${siteUrl}/auth/callback?next=/dashboard/parent`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data?.user) {
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

    return NextResponse.json({ ok: true, userId: data?.user?.id ?? null });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Invite failed" },
      { status: 500 }
    );
  }
}
