import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/auth";
import { getClientList } from "@/lib/clients";
import { LoginPage } from "@/components/auth/login-page";
import { CreditLink } from "@/components/credit-link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await hasAccess())) return <LoginPage />;

  if (process.env.DEMO_MODE === "true") redirect("/dashboard/demo");

  const clients = await getClientList();
  if (clients.length === 0) redirect("/admin");
  if (clients.length === 1) redirect(`/dashboard/${clients[0].id}`);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-black tracking-tight mb-8">Your dashboards</h1>
      <div className="w-full max-w-md space-y-3">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/${c.id}`}
            className="block rounded-lg border px-5 py-4 hover:bg-muted transition font-medium"
          >
            {c.name}
          </Link>
        ))}
        <Link href="/admin" className="block text-center text-sm text-muted-foreground pt-4 hover:underline">
          Add or manage dashboards
        </Link>
      </div>
      <CreditLink className="mt-10" />
    </div>
  );
}
