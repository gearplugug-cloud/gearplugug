# Gear Plug — GitHub + Hostinger Auto-Deploy Setup

Follow these once. After that, every change you push goes live automatically.

> IMPORTANT: The repository is the **`gear-plug-app`** folder only.
> Do NOT publish the outer `gearplug` folder — it holds large .zip files that
> must never go to GitHub. The `.gitignore` already excludes `node_modules`,
> `dist`, and `.env`.

---

## Step 1 — Push the project to GitHub (using GitHub Desktop, no command line)

1. Install **GitHub Desktop** from https://desktop.github.com and sign in with
   your GitHub account.
2. Menu: **File > Add local repository**.
3. Choose the folder: `Desktop\gearplug\gear-plug-app` (the inner folder).
4. It will say "this directory is not a Git repository" — click
   **"create a repository"**.
5. Name it `gear-plug-app`, leave the rest as-is, click **Create repository**.
6. Top bar: click **Publish repository**.
   - You can keep **"Keep this code private"** ticked (recommended).
   - Click **Publish repository**.

Your code is now on GitHub. The `deploy.yml` workflow goes up with it.

---

## Step 2 — Get your Hostinger FTP details

1. Log in to Hostinger and open **hPanel**.
2. Go to **Files > FTP Accounts**.
3. Note these four things (create an FTP account if you don't have one):
   - **FTP hostname / IP** (e.g. `82.x.x.x` or `ftp.yourdomain.com`)
   - **FTP username**
   - **FTP password** (set/reset it here if unsure)
   - **Folder / path** — usually `/public_html/` for your main domain.

---

## Step 3 — Add the secrets to GitHub

1. On GitHub, open your `gear-plug-app` repo.
2. Go to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret** and add each of these (name on the left,
   your value on the right):

   | Secret name | Value |
   | --- | --- |
   | `FTP_SERVER` | your FTP hostname/IP |
   | `FTP_USERNAME` | your FTP username |
   | `FTP_PASSWORD` | your FTP password |
   | `FTP_SERVER_DIR` | `/public_html/` (adjust if your site lives elsewhere) |

   These two are optional for now (the shop currently shows sample products),
   but add them when you wire up the live store:

   | Secret name | Value |
   | --- | --- |
   | `VITE_WC_URL` | your WooCommerce REST API URL |
   | `VITE_WC_AUTH` | your base64 WooCommerce auth token |

---

## Step 4 — Run the first deploy

The deploy runs automatically on every push. To trigger it now:

1. On GitHub, open the **Actions** tab of your repo.
2. Click the **"Build and Deploy to Hostinger"** workflow.
3. Click **Run workflow > Run workflow**.
4. Watch it go green (about 1–2 minutes). If a step fails, click it to read the
   error — usually a wrong FTP value.
5. Visit your domain — the site should be live.

---

## From now on

Change code → in GitHub Desktop, type a short summary → **Commit to main** →
**Push origin**. About a minute later your live site updates. That's the whole loop.
