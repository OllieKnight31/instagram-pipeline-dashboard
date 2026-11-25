/**
 * Create a blank Google Sheet with the correct tab structure for a client.
 *
 * Usage:
 *   npx tsx scripts/create-sheet-template.ts "Client Name"
 *
 * Requires GOOGLE_SERVICE_ACCOUNT_KEY env var.
 */

import { createClientSheet } from "../src/lib/google-sheets";

async function main() {
  const clientName = process.argv[2];

  if (!clientName) {
    console.error("Usage: npx tsx scripts/create-sheet-template.ts <client-name>");
    process.exit(1);
  }

  console.log(`Creating sheet for ${clientName}...`);
  const { spreadsheetId, spreadsheetUrl } = await createClientSheet(clientName);

  console.log(`\nSheet created!`);
  console.log(`Sheet ID: ${spreadsheetId}`);
  console.log(`URL: ${spreadsheetUrl}`);
  console.log(`\nTabs created: Setters, Closers, Ads, Payments`);
  console.log(`Shared: Anyone with the link can edit`);
}

main().catch(console.error);
