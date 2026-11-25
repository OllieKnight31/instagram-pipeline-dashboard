---
name: instagram-pipeline-dashboard
description: Sets up the free Instagram Pipeline Dashboard (profile visits to booked calls to closed deals, with setters, closers, ads and payments) from a Google Sheet, runs it locally and deploys it to Vercel. Use when the user says /instagram-pipeline-dashboard, "set up the pipeline dashboard", "build my DM setter dashboard", "track my setters and closers", or "deploy the Instagram dashboard".
---

# Instagram Pipeline Dashboard setup

You are setting up https://github.com/OllieKnight31/instagram-pipeline-dashboard for the user. Assume they are not technical. Do the work for them; only ask for things only they can give.

## 1. Get the code

If the current folder is not already this repo, clone it into a folder they choose (default `~/instagram-pipeline-dashboard`) and run `npm install`. Needs Node.js 20 or newer; if missing, tell them to install it from nodejs.org and wait.

## 2. Show the demo first

Run `DEMO_MODE=true npm run dev` in the background and open http://localhost:3000 in their browser so they see what they are getting. Ask: one business, or several (agency)?

## 3. Google Sheet

Ask if they already have a sheet. If not, explain the four tabs and headers from the README table, or offer to build it with `node create-template.js` once the service account exists (step 4).

## 4. Service account (the only fiddly part)

Walk them through it one click at a time:
1. console.cloud.google.com, new project, enable "Google Sheets API" (and "Google Drive API" if you will run create-template.js).
2. IAM and Admin, Service Accounts, Create. Then Keys, Add key, JSON. Ask them for the path of the downloaded file.
3. Read the `client_email` from that file and tell them to share their sheet with it (Viewer is enough, Editor if create-template.js should write).

Never print the private key back to them or paste it anywhere except `.env.local`.

## 5. Settings

Write `.env.local` from `.env.example`:
- `SHEET_ID` = their sheet link (single business). For an agency leave it empty and they add businesses at `/admin`.
- `GOOGLE_SERVICE_ACCOUNT_KEY` = the JSON file content on one line (`python3 -c "import json,sys;print(json.dumps(json.load(open(sys.argv[1]))))" file.json`).
- `BRAND_NAME`, `NEXT_PUBLIC_BRAND_NAME`, `BRAND_COLOR` from their answers.
- Leave `ACCESS_PASSWORD` empty unless they want the dashboard locked. Explain: empty means no login, anyone with the link can see it.

Restart `npm run dev` without DEMO_MODE and open `/dashboard/main` (or `/admin`). If numbers are empty, check the tab names and headers match exactly and the sheet is shared with the service account.

## 6. Deploy

Offer to deploy to Vercel: `npx vercel` (they log in), then add every variable from `.env.local` with `npx vercel env add` (production), then `npx vercel --prod`. For an agency also set `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID` and `VERCEL_TEAM_ID` so dashboards added at `/admin` are saved.

Finish with: their live link, where to add data (the sheet), and how to lock it later (`ACCESS_PASSWORD`).
