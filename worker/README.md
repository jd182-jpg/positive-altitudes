# Positive Altitudes — donation payment Worker

A tiny Cloudflare Worker that charges donations through Square. The website
sends it a one-time card token; the Worker charges the card using your secret
Square access token. The token lives only here, never in the website.

## What you need
- A Square account (you have one)
- A free Cloudflare account (cloudflare.com)

---

## Part A — get your Square credentials

1. Go to **developer.squareup.com** and sign in with your Square account.
2. Click **+** / **Create an application**. Name it `Positive Altitudes Website`.
3. Open the app. At the top, make sure the toggle is set to **Production**
   (not Sandbox) once you're ready to accept real donations.
4. From the **Credentials** page, copy these three values somewhere safe:
   - **Application ID** (starts with `sq0idp-...`) — PUBLIC, goes in the website
   - **Access token** (a long string) — SECRET, goes in the Worker only
   - **Location ID** — from the **Locations** page (PUBLIC)

> Send Jackson's assistant the **Application ID** and **Location ID** (public).
> Keep the **Access token** private — you'll paste it into Cloudflare yourself.

---

## Part B — deploy the Worker (easiest: Cloudflare dashboard, no tools)

1. Go to **dash.cloudflare.com** and create a free account / sign in.
2. Left menu: **Workers & Pages** -> **Create** -> **Create Worker**.
3. Name it `pa-donate`. Click **Deploy** (it deploys a placeholder).
4. Click **Edit code**. Delete everything in the editor, paste the entire
   contents of `worker.js` from this folder, then **Deploy** again.
5. Go to the Worker's **Settings** -> **Variables and Secrets** and add:
   | Name | Type | Value |
   |------|------|-------|
   | `SQUARE_ACCESS_TOKEN` | **Secret** (Encrypt) | your Square access token |
   | `SQUARE_LOCATION_ID` | Text | your Square location ID |
   | `SQUARE_ENV` | Text | `production` |
   | `ALLOWED_ORIGIN` | Text | `https://positivealtitudes.org` |
   Save. (Adding/redeploying may be needed for the secret to take effect.)
6. Copy your Worker's URL — it looks like
   `https://pa-donate.YOURNAME.workers.dev`.

> Send Jackson's assistant that **Worker URL**.

---

## Part B (alternative) — deploy with the CLI

```bash
npm install -g wrangler
cd worker
wrangler login                       # opens the browser to authorize
# edit wrangler.toml -> set SQUARE_LOCATION_ID
wrangler secret put SQUARE_ACCESS_TOKEN   # paste your token when prompted
wrangler deploy
```

---

## What to send back
Once deployed, send these three PUBLIC values (never the access token):
1. Square **Application ID**
2. Square **Location ID**
3. **Worker URL**

The on-page donation form gets wired to these and tested before going live.

## Testing safely
Set `SQUARE_ENV` to `sandbox` and use Square's sandbox credentials + test card
`4111 1111 1111 1111` to run fake donations first. Switch to `production` with
your real credentials when ready. Either way, do one small real donation and
refund it in the Square Dashboard to confirm the full flow.
