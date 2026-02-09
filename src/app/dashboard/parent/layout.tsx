import { protectRoute } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Protect route - only allow PARENT role (and admins for testing)
    await protectRoute(["PARENT", "ADMIN", "SUPER_ADMIN"]);
  } catch (error) {
    console.error("Parent dashboard auth error:", error);
    redirect("/auth/login");
  }

  return <>{children}</>;
}
