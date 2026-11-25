import { getActiveClientById, getAllClients } from "./db";
import type { ClientConfig, ClientInfo } from "@/types/dashboard";

/**
 * Single-business mode: set SHEET_ID (and optionally BRAND_NAME, BRAND_COLOR)
 * and your dashboard lives at /dashboard/main with no setup screen.
 * More dashboards can be added at /admin (agency mode).
 */
export const MAIN_ID = "main";

function mainClient(): ClientConfig | null {
  const sheetId = process.env.SHEET_ID;
  if (!sheetId) return null;
  return {
    id: MAIN_ID,
    name: process.env.BRAND_NAME || process.env.NEXT_PUBLIC_BRAND_NAME || "My Business",
    sheetId: sheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || sheetId.trim(),
    brandColor: process.env.BRAND_COLOR || "#3b82f6",
    status: "active",
  };
}

export async function getClientConfig(clientId: string): Promise<ClientConfig | null> {
  if (clientId === MAIN_ID) {
    const main = mainClient();
    if (main) return main;
  }
  return getActiveClientById(clientId);
}

export async function getClientList(): Promise<ClientInfo[]> {
  const main = mainClient();
  const clients = await getAllClients();
  const list = clients
    .filter((c) => c.status === "active")
    .map((c) => ({ id: c.id, name: c.name }));
  return main ? [{ id: main.id, name: main.name }, ...list] : list;
}
