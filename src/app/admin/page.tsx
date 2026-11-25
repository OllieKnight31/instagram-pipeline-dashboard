import { hasAccess, PASSWORD_REQUIRED } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { LoginPage } from "@/components/auth/login-page";
import { getServiceAccountEmail } from "@/lib/sheet-validation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await hasAccess())) return <LoginPage />;
  return <AdminDashboard serviceAccountEmail={getServiceAccountEmail()} passwordRequired={PASSWORD_REQUIRED} />;
}
