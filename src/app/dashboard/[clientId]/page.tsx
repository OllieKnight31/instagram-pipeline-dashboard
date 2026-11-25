import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/auth";
import { getClientConfig } from "@/lib/clients";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  if (!(await hasAccess())) redirect("/");

  const isDemo = process.env.DEMO_MODE === "true";
  const client = isDemo
    ? { id: clientId, name: "Peak Performance Coaching", brandColor: "#8b5cf6", status: "active" as const }
    : await getClientConfig(clientId);
  if (!client) redirect("/");

  return (
    <DashboardShell
      clientId={clientId}
      clientName={client.name}
      brandColor={client.brandColor}
      clients={[{ id: client.id, name: client.name }]}
    />
  );
}
