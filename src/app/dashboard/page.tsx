import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth/middleware";
import { getRolePermissions } from "@/lib/auth/rbac";

export default async function DashboardRouter() {
  const user = await verifyAuth();

  if (!user) redirect("/auth/login");

  const permissions = getRolePermissions(user.role);
  redirect(permissions.dashboardPath);
}
