import type { ClientConfig } from "@/types/dashboard";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Database layer:
 *   Local dev:  reads/writes data/clients.json
 *   Production: reads/writes CLIENTS_CONFIG via Vercel API (always fresh)
 */

const LOCAL_DB_PATH = join(process.cwd(), "data", "clients.json");
const IS_VERCEL = !!process.env.VERCEL;

interface ClientRecord {
  id: string;
  name: string;
  sheetId: string;
  brandColor: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

interface ClientsDb {
  clients: ClientRecord[];
}

// ============================================================
// Vercel API helpers
// ============================================================

function getVercelConfig() {
  return {
    token: process.env.VERCEL_API_TOKEN || "",
    projectId: process.env.VERCEL_PROJECT_ID || "",
    teamId: process.env.VERCEL_TEAM_ID || "",
  };
}

async function getEnvVarFromVercel(): Promise<{ id: string; value: string } | null> {
  const { token, projectId, teamId } = getVercelConfig();
  if (!token || !projectId) return null;

  const teamParam = teamId ? `&teamId=${teamId}` : "";
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?decrypt=true${teamParam}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const env = data.envs?.find((e: { key: string }) => e.key === "CLIENTS_CONFIG");
  if (!env) return null;

  return { id: env.id, value: env.value || '{"clients":[]}' };
}

async function setEnvVarOnVercel(value: string, existingId?: string): Promise<void> {
  const { token, projectId, teamId } = getVercelConfig();
  if (!token || !projectId) return;

  const teamParam = teamId ? `?teamId=${teamId}` : "";

  if (existingId) {
    await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env/${existingId}${teamParam}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value, type: "plain" }),
      }
    );
  } else {
    await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env${teamParam}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "CLIENTS_CONFIG",
          value,
          type: "plain",
          target: ["production", "preview"],
        }),
      }
    );
  }
}

// ============================================================
// Read / Write
// ============================================================

async function readDb(): Promise<ClientsDb> {
  if (IS_VERCEL) {
    const env = await getEnvVarFromVercel();
    if (env) {
      try {
        return JSON.parse(env.value);
      } catch {
        return { clients: [] };
      }
    }
    return { clients: [] };
  }

  // Local: read from file
  try {
    if (!existsSync(LOCAL_DB_PATH)) {
      const dir = join(process.cwd(), "data");
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(LOCAL_DB_PATH, JSON.stringify({ clients: [] }, null, 2));
    }
    return JSON.parse(readFileSync(LOCAL_DB_PATH, "utf-8"));
  } catch {
    return { clients: [] };
  }
}

async function writeDb(db: ClientsDb): Promise<void> {
  const json = JSON.stringify(db);

  if (IS_VERCEL) {
    const env = await getEnvVarFromVercel();
    await setEnvVarOnVercel(json, env?.id);
    return;
  }

  // Local: write to file
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2));
}

// ============================================================
// Public API
// ============================================================

export async function initDb(): Promise<void> {
  await readDb();
}

export async function getClientById(clientId: string): Promise<ClientConfig | null> {
  const db = await readDb();
  const client = db.clients.find((c) => c.id === clientId);
  if (!client) return null;
  return {
    id: client.id,
    name: client.name,
    sheetId: client.sheetId,
    brandColor: client.brandColor,
    status: client.status,
  };
}

export async function getActiveClientById(clientId: string): Promise<ClientConfig | null> {
  const client = await getClientById(clientId);
  if (!client || client.status !== "active") return null;
  return client;
}

export async function getAllClients(): Promise<ClientConfig[]> {
  const db = await readDb();
  return db.clients.map((c) => ({
    id: c.id,
    name: c.name,
    sheetId: c.sheetId,
    brandColor: c.brandColor,
    status: c.status,
    createdAt: c.createdAt,
  }));
}

export async function createClient(client: {
  id: string;
  name: string;
  sheetId: string;
  brandColor?: string;
}): Promise<void> {
  const db = await readDb();
  db.clients.push({
    id: client.id,
    name: client.name,
    sheetId: client.sheetId,
    brandColor: client.brandColor || "#3b82f6",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null,
  });
  await writeDb(db);
}

export async function updateClient(
  clientId: string,
  updates: Partial<{
    name: string;
    sheetId: string;
    brandColor: string;
    status: string;
  }>
): Promise<void> {
  const db = await readDb();
  const idx = db.clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return;

  if (updates.name !== undefined) db.clients[idx].name = updates.name;
  if (updates.sheetId !== undefined) db.clients[idx].sheetId = updates.sheetId;
  if (updates.brandColor !== undefined) db.clients[idx].brandColor = updates.brandColor;
  if (updates.status !== undefined) db.clients[idx].status = updates.status;
  db.clients[idx].updatedAt = new Date().toISOString();

  await writeDb(db);
}

export async function deleteClient(clientId: string): Promise<void> {
  const db = await readDb();
  db.clients = db.clients.filter((c) => c.id !== clientId);
  await writeDb(db);
}

export async function updateLastLogin(clientId: string): Promise<void> {
  const db = await readDb();
  const idx = db.clients.findIndex((c) => c.id === clientId);
  if (idx !== -1) {
    db.clients[idx].lastLogin = new Date().toISOString();
    await writeDb(db);
  }
}

export async function clientExists(clientId: string): Promise<boolean> {
  const db = await readDb();
  return db.clients.some((c) => c.id === clientId);
}
