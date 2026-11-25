const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const keyLine = envFile.split('\n').find(l => l.startsWith('GOOGLE_SERVICE_ACCOUNT_KEY='));
const keyJson = keyLine.split('=').slice(1).join('=');
const credentials = JSON.parse(keyJson);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'IG Pipeline Dashboard Template' },
      sheets: [
        { properties: { title: 'Setters', sheetId: 0 } },
        { properties: { title: 'Closers', sheetId: 1 } },
        { properties: { title: 'Ads', sheetId: 2 } },
        { properties: { title: 'Payments', sheetId: 3 } },
      ],
    },
  });

  const sheetId = spreadsheet.data.spreadsheetId;
  console.log('Sheet ID:', sheetId);

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'Setters!A1:O1', values: [['Date','Name','Messages Sent','Outbounds','Inbounds','Follow Ups','Links Sent','Booked Calls','Calls Proposed','Followers','Qualified Followers','Lead Quality','Notes','Hit KPIs','Profile Visits']] },
        { range: 'Closers!A1:N1', values: [['Date','Name','Calls Scheduled','Shows','No Shows','Offers Made','Closed','Revenue','Cash Collected','Follow Up Calls','Rescheduled','Avg Deal Value','Objections','Notes']] },
        { range: 'Ads!A1:N1', values: [['Date','Platform','Campaign','Spend','Impressions','Clicks','CTR','CPM','CPC','Leads','CPL','Booked Calls','ROAS','Notes']] },
        { range: 'Payments!A1:O1', values: [['Date','Client Name','Down Payment','Payment Method','Status','Programme','Payment Type','Total Contracted','Cash Collected','Due Date','Recurring','Stripe ID','Notes','Closer','Setter']] },
      ],
    },
  });

  const requests = [];
  for (const sid of [0, 1, 2, 3]) {
    requests.push(
      { updateSheetProperties: { properties: { sheetId: sid, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
      { repeatCell: { range: { sheetId: sid, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, backgroundColor: { red: 0.12, green: 0.12, blue: 0.14 }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)' } },
      { updateDimensionProperties: { range: { sheetId: sid, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 120 }, fields: 'pixelSize' } },
      { updateDimensionProperties: { range: { sheetId: sid, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 150 }, fields: 'pixelSize' } },
    );
  }
  requests.push({ updateDimensionProperties: { range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 12, endIndex: 13 }, properties: { pixelSize: 300 }, fields: 'pixelSize' } });
  requests.push({ updateDimensionProperties: { range: { sheetId: 1, dimension: 'COLUMNS', startIndex: 13, endIndex: 14 }, properties: { pixelSize: 300 }, fields: 'pixelSize' } });

  const dropdowns = [
    { sid: 3, col: 4, vals: ['Paid','Pending','Refunded'] },
    { sid: 3, col: 6, vals: ['PIF','Installment'] },
    { sid: 0, col: 13, vals: ['Yes','No'] },
    { sid: 0, col: 11, vals: ['Hot','Warm','Cold','Mixed'] },
  ];
  for (const d of dropdowns) {
    requests.push({ setDataValidation: { range: { sheetId: d.sid, startRowIndex: 1, startColumnIndex: d.col, endColumnIndex: d.col + 1 }, rule: { condition: { type: 'ONE_OF_LIST', values: d.vals.map(v => ({ userEnteredValue: v })) }, strict: false, showCustomUi: true } } });
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: sheetId, requestBody: { requests } });
  await drive.permissions.create({ fileId: sheetId, requestBody: { type: 'anyone', role: 'writer' } });

  console.log('URL: https://docs.google.com/spreadsheets/d/' + sheetId + '/edit');
}

main().catch(e => { console.error(e.message); process.exit(1); });
