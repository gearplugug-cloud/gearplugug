# Gear Plug UG

The Gear Plug storefront — a React + Vite single-page app for renting and selling
professional media equipment in Uganda. Catalog data is backed by a headless
WooCommerce store; this app is the customer-facing front end.

## Run locally

```bash
npm install        # first time only
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # produce the production build in ./dist
```

## Environment variables

Secrets are never committed. Copy `.env.example` to `.env` and fill in real values:

```
VITE_WC_URL=https://your-store/wp-json/wc/v3
VITE_WC_AUTH=base64_of_consumerKey:consumerSecret
```

> Note: Vite inlines `VITE_*` variables into the client bundle, so they are
> visible in the shipped site. A WooCommerce key/secret should ultimately sit
> behind a small server-side proxy. Treat any previously committed key as
> compromised and regenerate it in WooCommerce > Settings > Advanced > REST API.

## Auto-deploy to Hostinger

Pushing to the `main` branch triggers `.github/workflows/deploy.yml`, which
builds the site and uploads `./dist` to Hostinger over FTP.

Add these **GitHub repo Secrets** (Settings > Secrets and variables > Actions):

| Secret | What it is |
| --- | --- |
| `FTP_SERVER` | Hostinger FTP hostname (e.g. `ftp.yourdomain.com` or the IP from hPanel) |
| `FTP_USERNAME` | FTP account username from hPanel |
| `FTP_PASSWORD` | FTP account password |
| `FTP_SERVER_DIR` | Web root, e.g. `/public_html/` (or `/domains/yourdomain/public_html/`) |
| `VITE_WC_URL` | WooCommerce REST API URL (same as `.env`) |
| `VITE_WC_AUTH` | WooCommerce Basic-auth token (same as `.env`) |

Once the secrets are set, every `git push` to `main` redeploys the live site.
You can also trigger it manually from the repo's **Actions** tab.
