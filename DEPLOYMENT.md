# Deploying REFERGO (GitHub + Railway + Vercel)

| Part | Where | Folder |
|------|-------|--------|
| Website (React) | Vercel | `frontend` |
| API (Node/Express) | Railway | `backend` |
| Database (MySQL) | Railway | – |

## 0. Before you push to GitHub

1. `.env` files are now ignored (`.gitignore`). **`backend/.env` was committed in the
   first commit**, so its database password and `JWT_SECRET` are in the git history.
   - If the repo has **not** been pushed anywhere yet: delete the `.git` folder and run
     `git init` again, or
   - If it was already pushed: change the database password and `JWT_SECRET`.
2. Update the lock files. `nodemailer` and `argon2` (backend) and `fflate` (frontend) were added, and
   Railway/Vercel install exactly what the lock file says. In **both** `backend` and
   `frontend` run:
   ```
   npm install
   ```
   and commit the changed `package-lock.json` files.
3. Export your database. `database/refergo.sql` is empty, so the hosted database would have
   no tables. Export it from phpMyAdmin (Export → SQL) or run:
   ```
   mysqldump -u root -p refergo > database/refergo.sql
   ```
4. Commit and push:
   ```
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

## 1. Railway (database + API)

1. Railway → **New Project → Deploy from GitHub repo** → pick the repo.
2. Open the service → **Settings → Root Directory** → `backend`.
3. In the same project: **New → Database → Add MySQL**.
4. Backend service → **Variables**:
   ```
   MYSQL_URL      = ${{MySQL.MYSQL_URL}}
   NODE_ENV       = production
   JWT_SECRET     = (a long random text)
   FRONTEND_URL   = https://your-app.vercel.app     (fill in after step 3)
   ```
   plus the email variables in step 2 below.
5. **Settings → Networking → Generate Domain**. Open
   `https://<your-domain>/api/health`. It should show `{"success":true,"status":"ok"}`.
6. Load your data into the Railway MySQL. In the MySQL service, copy
   `MYSQL_PUBLIC_URL` (Variables tab), then on your computer, in `backend`:
   ```
   # PowerShell
   $env:MYSQL_URL="<paste MYSQL_PUBLIC_URL>"; npm run db:import
   # macOS / Linux
   MYSQL_URL="<paste MYSQL_PUBLIC_URL>" npm run db:import
   ```
   (Or import `database/refergo.sql` with HeidiSQL, DBeaver or MySQL Workbench.)

The backend adds the few extra columns/tables it needs (applicant gender and birthdate,
password reset codes) by itself when it starts.

## 2. Email for "Forgot password" (important on Railway)

Railway **blocks SMTP** (ports 25/465/587) on the Free, Trial and Hobby plans, so Gmail SMTP
will not work there. Use an email API over HTTPS. Brevo is free and needs no domain:

1. Create a Brevo account → **Senders, Domains & Dedicated IPs → Senders → Add a sender**
   (any email you own; confirm the link Brevo sends).
2. **SMTP & API → API Keys → Generate a new API key.**
3. On the Railway backend service add:
   ```
   BREVO_API_KEY    = (the key)
   MAIL_FROM_EMAIL  = (the verified sender email)
   MAIL_FROM_NAME   = REFERGO - PESO Mendez
   ```
(Resend also works: `RESEND_API_KEY` and `MAIL_FROM`, but it only emails other people
once you verify a domain.)

## 3. Vercel (website)

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory** → `frontend`. Framework: Vite (detected). 
3. **Environment Variables** (or edit `frontend/.env.production`, which holds a placeholder):
   ```
   VITE_API_URL = https://<your-railway-domain>
   ```
   (no trailing slash, no `/api`). The production build **stops with an error** if this is
   missing or still the placeholder, so a site that cannot load data is never published.
   If the backend itself serves the website, use `VITE_API_URL=same-origin`.
4. Deploy. Then copy the Vercel address into Railway's `FRONTEND_URL`
   (several addresses can be separated by commas) so the browser is allowed to call the API.

`vercel.json` makes page refreshes and direct links (for example `/dashboard`) work.

## 4. Checking

- `https://<railway-domain>/api/health` → ok
- Open the Vercel address → log in → the dashboard shows data.
- Forgot password → the code arrives by email.

## Troubleshooting

| Problem | Cause / fix |
|---------|-------------|
| Login page loads, no data, "CORS" in the browser console | `FRONTEND_URL` on Railway does not match the Vercel address exactly (including `https://`). Fix it and redeploy. |
| Requests go to the Vercel address and return 404 | `VITE_API_URL` is not set on Vercel. Set it and **redeploy** (it is read at build time). |
| Backend crashes at start: "JWT_SECRET is not set" | Add `JWT_SECRET` to the Railway variables. |
| Backend logs "ECONNREFUSED" / cannot reach the database | `MYSQL_URL` is not set on the backend service (use the reference `${{MySQL.MYSQL_URL}}`). |
| Tables not found | The data was not imported (step 1.6). |
| Forgot password: "The code could not be sent" | Check the Railway logs. Brevo error 4xx usually means the sender email is not verified or the API key is wrong. |
| Preview deployments on Vercel are blocked | Add their address to `FRONTEND_URL` too. |

Dates and times are handled in Philippine time (`DB_TIMEZONE`, default `+08:00`) wherever the
server runs.

## Where every address and secret comes from

Nothing is hard-coded to `localhost` any more. `localhost` is only the default for
`npm run dev`.

| Setting | Where to set it | Used for |
|---------|-----------------|----------|
| `VITE_API_URL` | Vercel → Environment Variables | Website → backend address (read at build time, so redeploy after changing) |
| `VITE_DEV_API` | `frontend/.env` (optional) | Backend address for `npm run dev` only |
| `FRONTEND_URL` | Railway variables | Website address(es) the backend accepts (CORS) |
| `MYSQL_URL` (or `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) | Railway variables | Database connection |
| `JWT_SECRET` | Railway variables | Signs login tokens (required in production) |
| `BREVO_API_KEY`, `MAIL_FROM_EMAIL` | Railway variables | Forgot-password emails |
| `DB_TIMEZONE` | Railway variables (optional) | Defaults to `+08:00` |

## Password hashing

Passwords are hashed with **Argon2id** (64 MiB memory, 3 passes), which OWASP lists first for
password storage. Accounts that still have an older bcrypt hash keep working: the first
successful login re-hashes the password with Argon2id automatically. The backend also widens
`users.password` to `VARCHAR(255)` at start-up if it is shorter, because an Argon2id hash is
about 100 characters long.
