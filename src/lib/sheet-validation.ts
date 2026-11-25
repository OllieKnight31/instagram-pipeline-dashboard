import { google } from "googleapis";

const REQUIRED_TABS = ["Setters", "Closers", "Ads", "Payments"];

function getAuthClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");

  const credentials = JSON.parse(keyJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

export function getServiceAccountEmail(): string {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) return "service-account@not-configured.iam.gserviceaccount.com";
  const credentials = JSON.parse(keyJson);
  return credentials.client_email || "unknown";
}

export async function validateSheet(sheetId: string): Promise<{
  valid: boolean;
  missingTabs: string[];
  error?: string;
}> {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: "sheets.properties.title",
    });

    const tabNames =
      response.data.sheets?.map((s) => s.properties?.title || "") || [];
    const missingTabs = REQUIRED_TABS.filter(
      (tab) => !tabNames.includes(tab)
    );

    return { valid: missingTabs.length === 0, missingTabs };
  } catch (err: unknown) {
    const error = err as { code?: number; message?: string };
    if (error.code === 404) {
      return {
        valid: false,
        missingTabs: REQUIRED_TABS,
        error: "Spreadsheet not found. Check the Sheet ID is correct.",
      };
    }
    if (error.code === 403) {
      return {
        valid: false,
        missingTabs: [],
        error:
          "Permission denied. Make sure you've shared the sheet with the service account email.",
      };
    }
    return {
      valid: false,
      missingTabs: [],
      error: error.message || "Failed to validate sheet",
    };
  }
}
