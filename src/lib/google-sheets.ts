import { google } from "googleapis";
import type {
  SetterDataRow,
  CloserDataRow,
  AdDataRow,
  PaymentDataRow,
} from "@/types/dashboard";

function getAuthClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  }

  const credentials = JSON.parse(keyJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

function parseSheetDate(raw: string | number): string {
  if (typeof raw === "number") {
    const date = new Date((raw - 25569) * 86400000);
    return date.toISOString().split("T")[0];
  }
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return String(raw);
}

/** Build a header→index map, normalising header names to lowercase trimmed */
function buildHeaderMap(headers: unknown[]): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] || "").trim().toLowerCase();
    if (h) map.set(h, i);
  }
  return map;
}

/** Get a cell value by header name (case-insensitive), with fallback aliases */
function col(row: unknown[], hmap: Map<string, number>, ...names: string[]): unknown {
  for (const name of names) {
    const idx = hmap.get(name.toLowerCase());
    if (idx !== undefined && idx < row.length) return row[idx];
  }
  return "";
}

function num(row: unknown[], hmap: Map<string, number>, ...names: string[]): number {
  return Number(col(row, hmap, ...names)) || 0;
}

function str(row: unknown[], hmap: Map<string, number>, ...names: string[]): string {
  return String(col(row, hmap, ...names) || "");
}

export async function fetchSetterData(sheetId: string): Promise<SetterDataRow[]> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Setters!A1:Z",
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const allRows = response.data.values || [];
  if (allRows.length < 2) return [];

  const hmap = buildHeaderMap(allRows[0]);

  return allRows.slice(1)
    .filter((row) => row[0])
    .map((row) => ({
      date: parseSheetDate(row[hmap.get("date") ?? 0] ?? ""),
      name: str(row, hmap, "name"),
      messagesSent: num(row, hmap, "messages sent", "messages"),
      outbounds: num(row, hmap, "outbounds"),
      inbounds: num(row, hmap, "inbounds"),
      followUps: num(row, hmap, "follow ups", "follow-ups", "followups"),
      linksSent: num(row, hmap, "links sent"),
      bookedCalls: num(row, hmap, "booked calls"),
      callsProposed: num(row, hmap, "calls proposed"),
      followers: num(row, hmap, "followers"),
      qualifiedFollowers: num(row, hmap, "qualified followers"),
      leadQuality: str(row, hmap, "lead quality"),
      notes: str(row, hmap, "notes"),
      hitKpis: str(row, hmap, "hit kpis", "hit kpi"),
      profileVisits: num(row, hmap, "profile visits"),
    }));
}

export async function fetchCloserData(sheetId: string): Promise<CloserDataRow[]> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Closers!A1:Z",
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const allRows = response.data.values || [];
  if (allRows.length < 2) return [];

  const hmap = buildHeaderMap(allRows[0]);

  return allRows.slice(1)
    .filter((row) => row[0])
    .map((row) => ({
      date: parseSheetDate(row[hmap.get("date") ?? 0] ?? ""),
      name: str(row, hmap, "name"),
      callsScheduled: num(row, hmap, "calls scheduled"),
      shows: num(row, hmap, "shows"),
      noShows: num(row, hmap, "no shows"),
      offersMade: num(row, hmap, "offers made"),
      closed: num(row, hmap, "closed"),
      revenue: num(row, hmap, "revenue"),
      cashCollected: num(row, hmap, "cash collected"),
      followUpCalls: num(row, hmap, "follow up calls", "follow-up calls"),
      rescheduled: num(row, hmap, "rescheduled"),
      avgDealValue: num(row, hmap, "avg deal value"),
      objections: str(row, hmap, "objections"),
      notes: str(row, hmap, "notes"),
    }));
}

export async function fetchAdData(sheetId: string): Promise<AdDataRow[]> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Ads!A1:Z",
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const allRows = response.data.values || [];
  if (allRows.length < 2) return [];

  const hmap = buildHeaderMap(allRows[0]);

  return allRows.slice(1)
    .filter((row) => row[0])
    .map((row) => ({
      date: parseSheetDate(row[hmap.get("date") ?? 0] ?? ""),
      platform: str(row, hmap, "platform"),
      campaign: str(row, hmap, "campaign"),
      spend: num(row, hmap, "spend"),
      impressions: num(row, hmap, "impressions"),
      clicks: num(row, hmap, "clicks"),
      ctr: num(row, hmap, "ctr"),
      cpm: num(row, hmap, "cpm"),
      cpc: num(row, hmap, "cpc"),
      leads: num(row, hmap, "leads"),
      cpl: num(row, hmap, "cpl"),
      bookedCalls: num(row, hmap, "booked calls"),
      roas: num(row, hmap, "roas"),
      notes: str(row, hmap, "notes"),
    }));
}

export async function fetchPaymentData(sheetId: string): Promise<PaymentDataRow[]> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Payments!A1:Z",
    valueRenderOption: "UNFORMATTED_VALUE",
  });

  const allRows = response.data.values || [];
  if (allRows.length < 2) return [];

  const hmap = buildHeaderMap(allRows[0]);

  return allRows.slice(1)
    .filter((row) => row[0])
    .map((row) => ({
      date: parseSheetDate(row[hmap.get("date") ?? hmap.get("closed date") ?? 0] ?? ""),
      clientName: str(row, hmap, "client name"),
      downPayment: num(row, hmap, "down payment"),
      paymentMethod: str(row, hmap, "payment method"),
      status: str(row, hmap, "status"),
      programme: str(row, hmap, "programme", "program"),
      paymentType: str(row, hmap, "payment type"),
      totalContracted: num(row, hmap, "total contracted"),
      revenue: num(row, hmap, "cash collected", "revenue"),
      dueDate: str(row, hmap, "due date") ? parseSheetDate(col(row, hmap, "due date") as string | number) : "",
      recurring: str(row, hmap, "recurring"),
      stripeId: str(row, hmap, "stripe id"),
      notes: str(row, hmap, "notes"),
    }));
}

export async function createClientSheet(clientName: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `${clientName} — IG Pipeline Dashboard` },
      sheets: [
        { properties: { title: "Setters", sheetId: 0 } },
        { properties: { title: "Closers", sheetId: 1 } },
        { properties: { title: "Ads", sheetId: 2 } },
        { properties: { title: "Payments", sheetId: 3 } },
      ],
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId!;
  const spreadsheetUrl = spreadsheet.data.spreadsheetUrl!;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: "Setters!A1:O1",
          values: [[
            "Date", "Name", "Messages Sent", "Outbounds", "Inbounds",
            "Follow Ups", "Links Sent", "Booked Calls", "Calls Proposed",
            "Followers", "Qualified Followers", "Lead Quality", "Notes", "Hit KPIs",
            "Profile Visits",
          ]],
        },
        {
          range: "Closers!A1:N1",
          values: [[
            "Date", "Name", "Calls Scheduled", "Shows", "No Shows",
            "Offers Made", "Closed", "Revenue", "Cash Collected",
            "Follow Up Calls", "Rescheduled", "Avg Deal Value", "Objections", "Notes",
          ]],
        },
        {
          range: "Ads!A1:N1",
          values: [[
            "Date", "Platform", "Campaign", "Spend", "Impressions",
            "Clicks", "CTR", "CPM", "CPC", "Leads", "CPL",
            "Booked Calls", "ROAS", "Notes",
          ]],
        },
        {
          range: "Payments!A1:M1",
          values: [[
            "Date", "Client Name", "Down Payment", "Payment Method", "Status",
            "Programme", "Payment Type", "Total Contracted", "Revenue",
            "Due Date", "Recurring", "Stripe ID", "Notes",
          ]],
        },
      ],
    },
  });

  // Format all tabs: frozen header row, bold headers, date column width
  const tabIds = [0, 1, 2, 3];
  const formatRequests = tabIds.flatMap((sheetId) => [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 0.15, green: 0.15, blue: 0.15 },
          },
        },
        fields: "userEnteredFormat(textFormat,backgroundColor)",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 120 },
        fields: "pixelSize",
      },
    },
  ]);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  // Share the sheet — anyone with the link can edit
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      type: "anyone",
      role: "writer",
    },
  });

  return { spreadsheetId, spreadsheetUrl };
}
