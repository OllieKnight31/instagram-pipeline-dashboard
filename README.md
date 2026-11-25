# Instagram Pipeline Dashboard

A free dashboard for anyone selling through Instagram DMs. Your team fills in one Google Sheet each day and this turns it into a live dashboard: profile visits to conversations to booked calls to closed deals, with setters, closers, ads and payments on their own tabs.

No login. No subscription. Deploy it once and send the link to your team.

## What you get

- **Overview**: the whole pipeline in one view with conversion rates between every step, compared with the previous period
- **Setters**: messages, follow ups, links sent, booked calls and KPI hits per setter, with a trend chart
- **Closers**: calls, shows, no shows, offers, closes, revenue and cash collected per closer
- **Ads**: spend, CPM, CPC, CTR, leads, CPL, booked calls and ROAS per campaign
- **Payments**: paid in full vs instalments, pending and refunded, revenue and cash collected
- **Periods**: daily, weekly, monthly or a custom date range
- **More than one business**: add as many dashboards as you like at `/admin`, each with its own sheet and brand colour
- **Demo mode**: see it working with sample data before connecting anything

## Try it in 2 minutes (demo data)

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/OllieKnight31/instagram-pipeline-dashboard.git
cd instagram-pipeline-dashboard
npm install
DEMO_MODE=true npm run dev
```

Open http://localhost:3000.

## Use it with your own numbers

### 1. Make your Google Sheet

Create a Google Sheet with four tabs named exactly `Setters`, `Closers`, `Ads` and `Payments`. Put these headers in row 1 of each tab:

| Tab | Row 1 headers |
|---|---|
| Setters | Date, Name, Messages Sent, Outbounds, Inbounds, Follow Ups, Links Sent, Booked Calls, Calls Proposed, Followers, Qualified Followers, Lead Quality, Notes, Hit KPIs, Profile Visits |
| Closers | Date, Name, Calls Scheduled, Shows, No Shows, Offers Made, Closed, Revenue, Cash Collected, Follow Up Calls, Rescheduled, Avg Deal Value, Objections, Notes |
| Ads | Date, Platform, Campaign, Spend, Impressions, Clicks, CTR, CPM, CPC, Leads, CPL, Booked Calls, ROAS, Notes |
| Payments | Date, Client Name, Down Payment, Payment Method, Status, Programme, Payment Type, Total Contracted, Cash Collected, Due Date, Recurring, Stripe ID, Notes, Closer, Setter |

Or let the script build it for you, with dropdowns and formatting: `node create-template.js` (needs step 2 first).

### 2. Connect your Google Sheet

The dashboard reads your sheet through a Google "service account" (a robot Google user):

1. Go to [Google Cloud Console](https://console.cloud.google.com), create a project and turn on the **Google Sheets API**.
2. Under **IAM and Admin, Service Accounts**, create a service account, open it, go to **Keys, Add key, JSON** and download the file.
3. Open your Google Sheet, click **Share** and share it with the service account's email (it ends in `iam.gserviceaccount.com`) as Viewer.

### 3. Fill in your settings

Copy `.env.example` to `.env.local` and fill in:

- `SHEET_ID`: the link to your sheet (or just its ID)
- `GOOGLE_SERVICE_ACCOUNT_KEY`: the whole JSON file from step 2, on one line
- `BRAND_NAME`, `BRAND_COLOR`: how it looks

Run `npm run dev` and open http://localhost:3000. Your dashboard is at `/dashboard/main`.

### 4. Put it online (free)

1. Push this folder to your own GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the same settings from `.env.local` under **Environment Variables** and deploy.

Send your team the link. That's it.

## Running dashboards for several businesses (agencies)

Leave `SHEET_ID` empty and open `/admin`. Add each business with its name, sheet link and colour, and you get a link per business.

On Vercel, dashboards you add are saved into a project setting, so also set `VERCEL_API_TOKEN` (create one at vercel.com/account/tokens), `VERCEL_PROJECT_ID` and, if you use a team, `VERCEL_TEAM_ID`. Locally they are saved in `data/clients.json`.

## Want a password? (optional)

By default there is **no login at all**. Anyone with the link can view the dashboard and open `/admin`.

If you would rather keep it private, set `ACCESS_PASSWORD` to any password you choose. Every page then asks for it once per week per device. Remove it to go back to open access.

## Use it with Claude Code

This repo includes a Claude Code skill that sets everything up with you step by step:

```bash
./install.sh
```

Then open Claude Code and type `/instagram-pipeline-dashboard`.

## Licence

MIT. Use it, change it, sell it to clients.
