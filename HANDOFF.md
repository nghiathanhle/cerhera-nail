# Cerhera Nails — Agent Handoff

Last updated: 2026-10-24 ~10:00 PM (America/New_York)

Use this document to continue work without re-discovering context. Prefer this over reconstructing history from chat.

> **No secrets in this file.** It records only *where* secrets live (e.g. `~/supabase/.env` on pi-1, vault entry names). Never paste key values here.

---

## What this project is

E‑commerce storefront for **Cerhera Nails** (press-on nail styles).

| Item | Value |
|------|--------|
| Brand | **Cerhera Nails** (plural — not “Cerhera Nail” / not “Petal Press”) |
| Domain | **cerheranails.com** (registered on Cloudflare, account owner Nghia) |
| Live site (target) | https://cerheranails.com (+ `www`) on **Cloudflare Pages**, project `cerhera-nail` (setup in progress, see below) |
| Live site (legacy) | https://nghiathanhle.github.io/cerhera-nail/ (GitHub Pages, `gh-pages` branch) |
| Test site | https://test.cerheranails.com (served from pi-1) |
| Backend (prod) | Self-hosted Supabase on pi-1 → https://api.cerheranails.com |
| Backend (test) | Self-hosted Supabase on pi-1 → https://api-test.cerheranails.com |
| GitHub repo | https://github.com/nghiathanhle/cerhera-nail |
| Default branch | `main` |
| Pages branch | `gh-pages` (static export of `out/`, legacy GitHub Pages) |
| Local folder (original) | `C:\Users\nghia\Cursor\petal-press` (Windows); cloud workspace may be `/workspace`; pi-1 clone `~/cerhera-nail-test` |
| npm package name | still `petal-press` (folder/legacy); brand is Cerhera Nails |

---

## Product decisions (v1 locked)

- Style-based ready sets (no made-to-order sizing flow yet)
- US shipping only; flat rate from `site_settings`
- Guest checkout via Stripe Checkout (hosted)
- No customer accounts
- Light admin (magic-link email allowlist) for styles + order fulfillment
- Stack: Next.js **static export** + Cloudflare Pages (was GitHub Pages) + Supabase (self-hosted on pi-1 for now; Supabase Cloud later) + Stripe

Placeholder brand was “Petal Press”; renamed to Cerhera Nails. User may rename again later via `site_settings.store_name` + metadata.

---

## Architecture (important)

The site host (Cloudflare Pages / GitHub Pages / nginx on pi-1) serves **static files only**. There is no Next.js server.

```
Browser (static Next.js, cerheranails.com)
  → Supabase Postgres/Storage/Auth (anon key)   https://api.cerheranails.com  (Cloudflare Tunnel → pi-1)
  → Supabase Edge Functions                      https://api.cerheranails.com/functions/v1/*
       create-checkout  → Stripe Checkout Session
       stripe-webhook   ← Stripe events (service role writes orders)
       order-status     → poll order after redirect
```

Do **not** add Next.js API routes / Server Actions expecting them to work on a static host. Backend must stay on Supabase Edge Functions (or another external host).

### Money path

1. Cart in `localStorage` (`petal-press-cart` key — legacy name)
2. Client calls Edge Function `create-checkout` with cart IDs/qty
3. Function reloads prices/stock from DB, creates Stripe session (US shipping address)
4. User pays on Stripe
5. Webhook `checkout.session.completed` inserts `orders` / `order_items`, decrements stock
6. Success page polls `order-status`

Never trust client prices.

---

## Repo layout

```
src/app/(store)/          Storefront pages (home, shop, cart, content, checkout)
src/app/admin/            Client-side admin (login + dashboard SPA tabs)
src/components/           UI
src/lib/                  products, settings, money, functions client, demo-data
supabase/migrations/      Schema + RLS + storage bucket
supabase/seed.sql         Demo styles (Unsplash URLs in product_images.storage_path)
supabase/functions/       Deno Edge Functions (excluded from tsconfig)
.github/workflows/deploy.yml  Optional Actions deploy to GitHub Pages (Pages currently uses gh-pages branch)
public/.nojekyll          Required for GitHub Pages (underscore folders)
postcss.config.mjs        @tailwindcss/postcss — required for CSS to compile
```

### Key files

| File | Role |
|------|------|
| `next.config.ts` | `output: 'export'`, `trailingSlash`, `basePath`/`assetPrefix` from `NEXT_PUBLIC_BASE_PATH` |
| `src/lib/env.ts` | Reads `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated allowlist) |
| `src/lib/demo-data.ts` | Fallback catalog when Supabase env missing |
| `src/lib/products.ts` | Reads active products (Supabase anon or demo) |
| `src/lib/functions.ts` | Calls Edge Functions with anon key; base URL = `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL` or `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1` |
| `src/components/cart-view.tsx` | Checkout → `create-checkout` |
| `src/components/admin-dashboard.tsx` | Client CRUD + orders |
| `.env.example` | Public env + comments for function secrets |

### Environment variables read by the app (build-time, all public)

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API base URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Admin allowlist (client-visible), currently `nghiathanhle.25@gmail.com,angela.nguyen646@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (Stripe success/cancel redirects) |
| `NEXT_PUBLIC_BASE_PATH` | Sub-path; `/cerhera-nail` only for GitHub Pages; **unset** for cerheranails.com and test site |
| `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL` | Optional override for Edge Functions base URL |

Edge Function secrets (server-side, never `NEXT_PUBLIC_`): `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

---

## Current status

### Done

- [x] Full storefront UI (whimsical blush/ink design; Fraunces + Outfit)
- [x] Static export for GitHub Pages with `basePath=/cerhera-nail`
- [x] Demo catalog fallback (6 styles)
- [x] Cart + Stripe Checkout flow wired to Edge Functions (code present; not production-configured)
- [x] Admin magic-link UI + dashboard (needs Supabase Auth + allowlist)
- [x] Content pages: size chart, how to apply, care, shipping, returns, privacy
- [x] Schema migration + seed SQL
- [x] Edge Functions: `create-checkout`, `stripe-webhook`, `order-status`
- [x] Brand copy → **Cerhera Nails**
- [x] Live deploy to Pages
- [x] Fix: Next/Image `fill` overlay blocking clicks → use width/height on product cards
- [x] Fix: Pages CSS 404 — Jekyll stripping `_next/` without `.nojekyll`; deploy with `--dotfiles --nojekyll`
- [x] Fix: Tailwind not compiling with `@tailwindcss/turbopack` alone → `@tailwindcss/postcss` + `postcss.config.mjs`
- [x] Broken Unsplash URLs replaced for some products (Garden Ink, Seafoam)
- [x] Home header contrast over hero improved
- [x] Domain `cerheranails.com` registered on Cloudflare
- [x] Self-hosted Supabase **prod** (`~/supabase`) and **test** (`~/supabase-test`) stacks on pi-1, exposed via Cloudflare Tunnel `pi-1-supabase`
- [x] Migration `20261024203150_initial_schema.sql` + `seed.sql` applied to **test** and **prod** (6 products, 7 product images, `site_settings` row, `product-images` public bucket, 19 RLS policies; orders empty)
- [x] Prod auth: `SITE_URL=https://cerheranails.com`; redirect allow-list includes GitHub Pages, `https://cerheranails.com`, `https://www.cerheranails.com`
- [x] Test site built on pi-1 and live at https://test.cerheranails.com (against test Supabase)
- [x] Migration `20261025010000_admin_only_rls.sql` (PR #2, merge `f6e4b91`) applied to **test** then **prod** on 2026-10-24 ~9:01 PM EDT, each in one transaction with `ON_ERROR_STOP=1`, after a `pg_dump` backup (see “Database backups”). 15 `Admins …` policies, 0 old `Authenticated …` write/read policies remain
- [x] Prod `public.admins` seeded with `nghiathanhle.25@gmail.com` and `angela.nguyen646@gmail.com`; test `public.admins` is empty (test has no auth users)
- [x] Old GitHub Pages DNS records removed from the Cloudflare zone (only tunnel records `api`, `api-test`, `test` remain until Pages domains are attached)

### Not done / in progress

- [ ] **Cloudflare Pages project `cerhera-nail`** — Git connection needs GitHub authorization of the “Cloudflare Workers and Pages” app; then build settings + env vars + custom domains `cerheranails.com` and `www.cerheranails.com`
- [ ] Deploy Edge Functions to self-hosted Supabase (`~/supabase/volumes/functions/` currently only has the stock `main` + `hello`) + set Stripe secrets
- [ ] Create Stripe account (test) + webhook to `https://api.cerheranails.com/functions/v1/stripe-webhook`
- [x] Prod admin auth user `nghiathanhle.25@gmail.com` created 2026-10-24 (email confirmed; random password generated on pi-1 and discarded — login is magic link only)
- [x] Prod admin auth user `angela.nguyen646@gmail.com` created 2026-10-24 (email confirmed, random password discarded; no login link issued — she needs SMTP-delivered magic link or an operator-generated link)
- [ ] Verify admin login end-to-end (one-time link issued 2026-10-24, see Security notes)
- [ ] Real product photos (still Unsplash placeholders; some shop cards show wrong/non-nail imagery)
- [ ] Product attributes for press-ons: `shape`, `length`, `finish`, wear time, kit contents (see UX audit below)
- [ ] Shop filters by shape/length; size chart mm diagram
- [ ] **No end-to-end Stripe test checkout yet** — blocked on Edge Functions deploy + Stripe keys/webhook
- [x] Prod pooler ports 5432/6543 bound to `127.0.0.1` (2026-10-24). Note: `update.sh` / upstream compose updates may revert this edit — re-check after updating.
- [x] Prod `DISABLE_SIGNUP=true` (2026-10-24); public `/auth/v1/signup` and OTP user-creation return 422 `signup_disabled`
- [ ] **Configure real SMTP on prod** — `SMTP_HOST` is still the template placeholder `supabase-mail` (no mail container), so magic links cannot be delivered
- [ ] Add `**.cerheranails.com` (or `api.cerheranails.com`) to `images.remotePatterns` in `next.config.ts` if Storage images are ever rendered through next/image
- [ ] Turn on Cloudflare “Always Use HTTPS”
- [ ] DHCP reservation (or Ethernet) for pi-1 — it is on Wi-Fi with a dynamic `192.168.1.231`
- [ ] Retire or update `.github/workflows/deploy.yml` (GitHub Pages) once Cloudflare Pages is live
- [ ] Later: migrate to Supabase Cloud (checklist below)
- [ ] Rename npm package / cart storage key from `petal-press` if desired
- [ ] Delete leftover remote branch `cursor/fix-gh-pages-nojekyll-9dc5` if unused

### Known pitfalls (do not regress)

1. **GitHub Pages only:** deploy with `npm run deploy:pages` (uses `gh-pages -d out --dotfiles --nojekyll`). Without `.nojekyll`, GitHub Pages runs Jekyll and drops `_next/` → unstyled site.
2. **Bake public env into the static build.** Changing Supabase URL/key after deploy requires rebuild + redeploy (Cloudflare Pages: change env var → retry deployment).
3. **Base path:** set `NEXT_PUBLIC_BASE_PATH=/cerhera-nail` only for GitHub Pages. Leave it **unset** for `npm run dev`, Cloudflare Pages (cerheranails.com) and the pi-1 test site.
4. **Do not use Next API routes** for checkout/webhooks on this hosting model.
5. **Admin security:** `NEXT_PUBLIC_ADMIN_EMAILS` is only a client-visible UI check. Postgres enforces admin access via `public.admins` + `public.is_admin()` (migration `20261025010000_admin_only_rls.sql`, applied on test and prod). An allowlisted user with no `admins` row sees empty admin lists / RLS errors on save; an empty `admins` table locks catalog writes and order reads for every logged-in user. Prod also keeps `DISABLE_SIGNUP=true`.
6. **OAuth `workflow` scope:** early push of `.github/workflows` failed once; file exists on `main` now. GitHub Pages source is **legacy `gh-pages` branch**, not Actions.
7. **Never expose Postgres** (5432 / 6543 or test 54322 / 56543) through the tunnel or router. The tunnel only routes the Supabase API paths listed below.
8. **pi-1 Wi-Fi is flaky** — SSH may drop; retry. Use `ssh -o BatchMode=yes nghia@192.168.1.231` from the Mac mini.

---

## Infrastructure: pi-1 (Raspberry Pi)

| Item | Value |
|------|-------|
| Host | `pi-1`, Debian 13 (trixie) aarch64, 8 GB RAM |
| LAN IP | `192.168.1.231` (DHCP on `wlan0` — not reserved yet) |
| Access | `ssh nghia@192.168.1.231` (key auth from Nghia's Mac mini, `~/.ssh/id_ed25519`); `nghia` has passwordless sudo |
| Runtime | Docker + docker compose |

### Supabase stacks (self-hosted docker compose, Envoy gateway)

| | Prod | Test |
|--|------|------|
| Directory | `~/supabase` | `~/supabase-test` |
| Compose project | `supabase` (containers `supabase-*`) | `supabase-test` (containers `supabase-test-*`) |
| Secrets file | `~/supabase/.env` (mode 600) | `~/supabase-test/.env` (mode 600, separate keys) |
| `.env` backups | `~/supabase/.env.bak-YYYYMMDD-HHMMSS` (mode 600) | — |
| DB backups | `~/supabase/backup-pre-admin-rls-20261024-210108.dump` (mode 600, `pg_dump -Fc`) | `~/supabase-test/backup-pre-admin-rls-20261024-210108.dump` (mode 600) |
| `DISABLE_SIGNUP` | `true` (operator-created users only) | `false` |
| Gateway (Envoy) | `0.0.0.0:8000` (LAN) | `0.0.0.0:8001` (LAN) |
| Public URL | https://api.cerheranails.com | https://api-test.cerheranails.com |
| Postgres / pooler host ports | `127.0.0.1:5432`, `127.0.0.1:6543` (localhost only; edited in `docker-compose.yml`, backup `docker-compose.yml.bak-20261024-204316`) | `127.0.0.1:54322`, `127.0.0.1:56543` (localhost only) |
| `SITE_URL` | `https://cerheranails.com` | `http://192.168.1.231:8001` |
| `ADDITIONAL_REDIRECT_URLS` | `https://nghiathanhle.github.io,https://cerheranails.com,https://www.cerheranails.com` | `http://localhost:3000,https://nghiathanhle.github.io,https://test.cerheranails.com` |
| Studio | LAN only, `http://192.168.1.231:8000/` (basic auth `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD` in `.env`); **not** routed by the tunnel | LAN only, `:8001` |

Compose services: `db imgproxy rest storage studio api-gw functions meta realtime supavisor auth`.

Common commands (run inside the stack directory):

```bash
docker compose ps
docker compose up -d auth            # apply auth (.env) changes, e.g. SITE_URL / redirect URLs
docker compose up -d --force-recreate  # after rotating keys
docker exec -i supabase-db psql -U postgres          # prod SQL (test: supabase-test-db)
cat supabase/migrations/*.sql supabase/seed.sql \
  | docker exec -i supabase-db psql -U postgres -v ON_ERROR_STOP=1 --single-transaction   # (from repo clone) fresh DB only
```

#### Applying a new migration (test first, then prod)

```bash
umask 077; ts=$(date +%Y%m%d-%H%M%S)
# 1. Back up (custom format, mode 600, kept in the stack dir)
docker exec supabase-test-db pg_dump -U supabase_admin -d postgres -Fc > ~/supabase-test/backup-$ts.dump
docker exec supabase-db      pg_dump -U supabase_admin -d postgres -Fc > ~/supabase/backup-$ts.dump
# 2. Apply one file atomically, test first
docker exec -i supabase-test-db psql -U postgres -v ON_ERROR_STOP=1 --single-transaction \
  < ~/cerhera-nail-test/supabase/migrations/<file>.sql
# 3. Check test (API + site), then repeat step 2 with supabase-db
```

Restore (only if needed; overwrites objects in the dump): `docker exec -i supabase-db pg_restore -U supabase_admin -d postgres --clean --if-exists < ~/supabase/backup-<ts>.dump`. Applied migrations so far: `20261024203150_initial_schema.sql` (+ `seed.sql`), `20261025010000_admin_only_rls.sql`. There is no migration-history table on the self-hosted stacks; track applied files here.

Edge Functions (self-hosted): copy `supabase/functions/<name>/` into `~/supabase/volumes/functions/<name>/`, add `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` to `~/supabase/.env` and pass them to the `functions` service in `docker-compose.yml`, then `docker compose up -d functions`. Not done yet.

### Cloudflare Tunnel `pi-1-supabase`

| Item | Value |
|------|-------|
| Tunnel ID | `3b09e17f-0705-4400-83e5-b52937398e11` |
| Cloudflare account | Nghia's (ID `40f07a8c282dc32b2acb801922e34d43`) |
| Service | systemd `cloudflared` on pi-1 |
| Config | `/etc/cloudflared/config.yml` (root-owned; backup `config.yml.bak-*`) |
| Credentials | `/etc/cloudflared/3b09e17f-0705-4400-83e5-b52937398e11.json` (root, mode 600) |
| DNS | Proxied tunnel records `api`, `api-test`, `test` (→ `<tunnel-id>.cfargotunnel.com`) |

Ingress rules:

- `api.cerheranails.com` → `http://localhost:8000`, **only** for `^/(rest|auth|storage|realtime|functions|graphql)/v1(/|$)` and `^/\.well-known/oauth-authorization-server/auth/v1$`. Paths containing `..` / `%2e` → 404. Everything else (Studio `/`, `/pg`, `/mcp`) → 404.
- `api-test.cerheranails.com` → same rules, `http://localhost:8001`.
- `test.cerheranails.com` → `http://localhost:8080` (test site nginx).
- Catch-all → 404.

After editing config: `sudo cloudflared tunnel ingress validate --config /etc/cloudflared/config.yml && sudo systemctl restart cloudflared`.

### Test site (test.cerheranails.com)

| Item | Value |
|------|-------|
| Repo clone | `~/cerhera-nail-test` (tracks `origin/main`) |
| Build env | `~/cerhera-nail-test/.env.local` (mode 600, gitignored): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` (api-test), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (test anon), `NEXT_PUBLIC_ADMIN_EMAILS` |
| Build script | `~/cerhera-nail-test/build.sh` (untracked, excluded via `.git/info/exclude`) — runs `npm ci && npm run build` in `node:22-bookworm-slim` Docker → `out/` |
| Server | compose project `cerhera-nail-test` in `~/cerhera-nail-test-server/` (nginx:1.29-alpine, `127.0.0.1:8080`, restart unless-stopped, `X-Robots-Tag: noindex`) serving `~/cerhera-nail-test/out` read-only |

Update steps:

```bash
cd ~/cerhera-nail-test
git pull --ff-only
./build.sh                       # recreates out/
docker restart cerhera-nail-test-web   # REQUIRED: build replaces the out/ dir, so the nginx bind mount goes stale (403) until restarted
curl -s https://test.cerheranails.com | grep -o '<title>[^<]*'
# If a new migration was added: back up, apply to test first, then prod (see “Applying a new migration”)
```

---

## Production hosting: Cloudflare Pages (plan / in progress)

| Setting | Value |
|---------|-------|
| Project | `cerhera-nail` (Git-connected to `nghiathanhle/cerhera-nail`) |
| Production branch | `main` |
| Framework preset | None / Next.js (static export) |
| Build command | `npm run build` |
| Output directory | `out` |
| Env vars (names only) | `NODE_VERSION` (=22), `NEXT_PUBLIC_SITE_URL` (=https://cerheranails.com), `NEXT_PUBLIC_SUPABASE_URL` (=https://api.cerheranails.com), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (prod anon key from `~/supabase/.env` `ANON_KEY`), `NEXT_PUBLIC_ADMIN_EMAILS` |
| Do **not** set | `NEXT_PUBLIC_BASE_PATH` |
| Custom domains | `cerheranails.com`, `www.cerheranails.com` (Cloudflare creates the DNS records when attached) |

Verify after deploy:

```bash
curl -sI https://cerheranails.com | head -1
curl -sL https://cerheranails.com | grep -o '<title>[^<]*'
curl -s -o /dev/null -w '%{http_code}\n' https://api.cerheranails.com/auth/v1/health        # 200
curl -s https://api.cerheranails.com/rest/v1/products?select=name -H "apikey: $ANON"         # 6 products
```

---

## Deploy commands (legacy GitHub Pages)

```bash
# From repo root
export NEXT_PUBLIC_BASE_PATH=/cerhera-nail
export NEXT_PUBLIC_SITE_URL=https://nghiathanhle.github.io/cerhera-nail
# Optional if Supabase ready:
# export NEXT_PUBLIC_SUPABASE_URL=...
# export NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# export NEXT_PUBLIC_ADMIN_EMAILS=nghiathanhle.25@gmail.com,angela.nguyen646@gmail.com

npm ci
npm run build
npm run deploy:pages   # publishes out/ → gh-pages with .nojekyll
```

PowerShell equivalent uses `$env:NEXT_PUBLIC_BASE_PATH="/cerhera-nail"` etc.

Verify after deploy:

```bash
# CSS must 200
curl -sL https://nghiathanhle.github.io/cerhera-nail/ \
  | grep -oE '/cerhera-nail/_next/static/chunks/[^"]+\.css' | head -1
# Title should say Cerhera Nails
curl -sL https://nghiathanhle.github.io/cerhera-nail/ | grep -o '<title>[^<]*'
```

---

## Integrations setup (next agent priority)

### Supabase (self-hosted on pi-1, current)

1. ~~Run migration SQL + `seed.sql`~~ — done on prod and test (2026-10-24)
2. Auth redirect URLs are set via `ADDITIONAL_REDIRECT_URLS` in the stack `.env` (+ `docker compose up -d auth`). Admin magic link lands on `/admin/`.
3. Deploy Edge Functions into `volumes/functions/` (see pi-1 section)
4. Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in `~/supabase/.env`; `SUPABASE_SERVICE_ROLE_KEY` = `SERVICE_ROLE_KEY` from the same file

### Stripe

1. Test mode API secret key → Supabase secret
2. Webhook endpoint: `https://api.cerheranails.com/functions/v1/stripe-webhook` (Supabase Cloud later: `https://PROJECT.supabase.co/functions/v1/stripe-webhook`)
3. Event: `checkout.session.completed`
4. Signing secret → `STRIPE_WEBHOOK_SECRET`
5. No need to pre-create Stripe Products; line items built from DB prices

### Site env (build-time)

See “Environment variables read by the app” and the Cloudflare Pages table. Values live in: prod anon key → `~/supabase/.env` (`ANON_KEY`); test anon key → `~/supabase-test/.env`; test build → `~/cerhera-nail-test/.env.local`.

---

## Admins

| Item | Value |
|------|-------|
| Admin emails | `nghiathanhle.25@gmail.com`, `angela.nguyen646@gmail.com` |
| Allowlist (prod site) | Cloudflare Pages project `cerhera-nail` → env var `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated; redeploy after change) |
| Allowlist (test site) | `~/cerhera-nail-test/.env.local` on pi-1 → `NEXT_PUBLIC_ADMIN_EMAILS`; then `./build.sh` + `docker restart cerhera-nail-test-web` |
| Prod auth users | Both emails exist in prod `auth.users` (created via GoTrue admin API on pi-1; signups are disabled, so new admins must be added the same way or via Studio → Authentication → Add user) |
| Test auth users | None (test stack still allows signups) |
| DB admin rows (`public.admins`) | Prod: both emails (seeded 2026-10-24). Test: none |

Admin access needs **three** things: (1) an auth user (prod: operator-created, signups disabled), (2) a row in `public.admins`, (3) the email in `NEXT_PUBLIC_ADMIN_EMAILS` so the UI shows the dashboard. Only (2) is enforced by Postgres; (3) is UI-only.

Seed / add an admin (run as `postgres` on the Pi, never through the API; no password involved):

```bash
docker exec -i supabase-db psql -U postgres -v ON_ERROR_STOP=1 <<'SQL'
insert into public.admins (user_id)
select id from auth.users where email in ('someone@example.com')
on conflict do nothing;
select u.email from public.admins a join auth.users u on u.id = a.user_id order by u.email;
SQL
```

If the select doesn't list the email, that auth user doesn't exist in that database yet: create it first (GoTrue admin API on the Pi, or Studio → Authentication → Add user), then re-run. Remove an admin with `delete from public.admins where user_id = (select id from auth.users where email = '...');` (deleting the auth user also cascades). For the test stack use `supabase-test-db`; it has no users, so create a test auth user (signups are open there) before seeding it.

---

## Secrets: where they live and how to rotate

| Secret | Location | Rotate |
|--------|----------|--------|
| `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY` (prod / test) | `~/supabase/.env`, `~/supabase-test/.env` | Back up `.env`; generate a new `JWT_SECRET` and re-sign anon/service JWTs (stack scripts `utils/generate-keys.sh`, `utils/rotate-new-api-keys.sh`, `utils/add-new-auth-keys.sh`; read each before running); `docker compose up -d --force-recreate`; update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Cloudflare Pages / `.env.local` and rebuild; update function secrets. Existing user sessions are invalidated. |
| `POSTGRES_PASSWORD` | stack `.env` | `utils/db-passwd.sh` in the stack dir, then recreate services |
| `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` (Studio) | stack `.env` | Edit `.env`, `docker compose up -d --force-recreate api-gw studio` |
| Other generated keys (`SECRET_KEY_BASE`, `VAULT_ENC_KEY`, `PG_META_CRYPTO_KEY`, S3/Logflare keys) | stack `.env` | Edit + recreate; `VAULT_ENC_KEY` change breaks existing Vault secrets |
| SMTP credentials | stack `.env` (`SMTP_*`) | Rotate at the mail provider, update `.env`, `docker compose up -d auth` |
| Stripe secret / webhook secret | (to be added) `~/supabase/.env` | Roll in Stripe dashboard, update `.env`, restart `functions` |
| Cloudflare Tunnel credentials | `/etc/cloudflared/<tunnel-id>.json` (root 600) | Cloudflare dashboard → Zero Trust → Tunnels, or `cloudflared tunnel` CLI; restart `cloudflared` |
| Cloudflare / GitHub logins | Nghia's Grok Bot vault (GitHub entry `github.com`); Cloudflare session in the bot's box browser | Change at provider |
| Test build env | `~/cerhera-nail-test/.env.local` (600) | Rebuild after change |

Rules: `.env*` files stay mode 600 and gitignored (repo `.gitignore` has `.env*` / `!.env.example`). Never commit keys; never prefix server secrets with `NEXT_PUBLIC_`.

---

## Migration checklist: self-hosted (pi-1) → Supabase Cloud

1. Create a Supabase Cloud project (pick US region); note project ref, URL, anon key, service role key (store in a password manager, not the repo).
2. Schema: `npx supabase link --project-ref <ref>` and `npx supabase db push` (applies `supabase/migrations/`), or run the migration SQL in the SQL editor. Confirm RLS policies + `product-images` bucket exist.
3. Data: dump only app data from pi-1, e.g. `docker exec supabase-db pg_dump -U postgres --data-only --schema=public > public-data.sql` (and `auth.users` only if admin users must be kept); restore with `psql "$CLOUD_DB_URL"`. Do not overwrite Cloud-managed schemas.
4. Storage: copy objects in `product-images` (download via Studio/API from pi-1, upload to Cloud) and fix any `product_images.storage_path` that are absolute pi-1 URLs.
5. Auth: Site URL `https://cerheranails.com`; redirect URLs `https://cerheranails.com/**`, `https://www.cerheranails.com/**`, `http://localhost:3000/**`; configure SMTP; disable public signups (see Security).
6. Edge Functions: `npx supabase functions deploy create-checkout stripe-webhook order-status`; `npx supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...`.
7. Stripe: point the webhook to `https://<ref>.supabase.co/functions/v1/stripe-webhook`; update signing secret.
8. Site: in Cloudflare Pages set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Cloud values; redeploy; add `**.supabase.co` (already in `images.remotePatterns`).
9. Verify: products load, admin magic link, test checkout with `4242…`, order appears.
10. Decommission: remove/ disable the `api.cerheranails.com` tunnel route (keep test if wanted), `docker compose down` prod stack after a final backup, rotate any keys that were ever shared.

---

## Security notes (audit 2026-10-24)

- **No hardcoded credentials** found in the repo working tree or full git history (all branches): no JWTs, `sk_live`/`sk_test`/`whsec_` values, or passwords. `.env.example` / README contain only placeholders (`sk_test_...`, `whsec_...`). Edge Functions read secrets via `Deno.env.get`.
- Supabase compose dirs: no hardcoded secrets outside `.env`; matches are upstream scripts/tests that read `.env` or use `changeme` test fixtures.
- `.env`, `.env.local`, `.env.bak-*` are mode 600 and gitignored. Built `out/` bundles contain the **test anon** JWT (expected; public key).
- **Fixed — admin authorization (2026-10-24, migration `20261025010000_admin_only_rls.sql`, PR #2):**
  - `public.admins (user_id → auth.users, on delete cascade)`: RLS on, no policies, no grants to `anon`/`authenticated`, so the Data API can't read or edit it (anon `GET /rest/v1/admins` → 401 permission denied).
  - `public.is_admin()`: `security definer`, `stable`, empty `search_path`; true only when `auth.uid()` is in `public.admins`.
  - Catalog insert/update/delete (`products`, `product_images`, `site_settings`), `product-images` bucket writes, `orders` read/update and `order_items` read now require `is_admin()`. Inactive products and all product images are admin-only reads.
  - Public reads unchanged (site settings, active products, their images, public bucket objects). Edge Functions use the service role and bypass RLS, so checkout / webhook / order-status need no admin row.
  - Verified on prod 2026-10-24: anon reads 6 products via https://api.cerheranails.com; anon insert → 401 RLS violation; anon update → 0 rows changed; anon orders → `[]`. In a rolled-back SQL transaction a non-admin `authenticated` JWT (random uid) saw `is_admin=false`, 0 orders, update matched 0 rows and insert failed RLS; Nghia's uid saw `is_admin=true` and could update all 6 rows (rolled back, no data changed).
- Prod Postgres/pooler ports are bound to `127.0.0.1` (fixed 2026-10-24).
- Prod public signups disabled (`DISABLE_SIGNUP=true`, fixed 2026-10-24). Admin users must be created by an operator (Studio → Authentication → Add user, on the LAN dashboard). Admin login is magic link (`signInWithOtp` in `src/app/admin/login/page.tsx`), which needs working SMTP.
- **Admin user / one-time login (no SMTP yet):** with signups disabled and no working SMTP, the admin user was created and a login link issued on pi-1 only, using the GoTrue admin API at `http://localhost:8000/auth/v1` with `SERVICE_ROLE_KEY` read from `~/supabase/.env` inside a remote Python script (key never on a command line or in logs):
  1. `POST /admin/users` `{email, password: <random, discarded>, email_confirm: true}`
  2. `POST /admin/generate_link` `{type: "magiclink", email, redirect_to: "https://cerheranails.com/admin/"}` → `action_link` on `https://api.cerheranails.com/auth/v1/verify` (host comes from `API_EXTERNAL_URL`)
  Links are single use and expire after `MAILER_OTP_EXP` (not set in `.env` → GoTrue default 86400 s / 24 h). Repeat step 2 to issue a new link until SMTP is configured; then use the normal login page.

---

## Data model (summary)

- `site_settings` (singleton id=1): `store_name`, `flat_shipping_cents`, `free_shipping_threshold_cents`
- `products`: name, slug, description, price_cents, stock, active, featured, sort_order
- `product_images`: `storage_path` may be full `https://` URL or Storage path under bucket `product-images`
- `orders` / `order_items`: written by webhook; statuses `pending|paid|shipped|cancelled`
- `admins`: `user_id` of operators allowed to manage the catalog and fulfill orders. Not exposed through the Data API.

---

## Design notes

- Soft blush / warm ink / paper background + grain (avoid purple SaaS / cream-terracotta clichés)
- Hero: brand-first, one headline, one CTA, full-bleed image
- Cards only where interaction needs them; storefront is not a dashboard
- Mobile-first

Next.js in this repo may differ from “classic” Next — see `AGENTS.md` / `node_modules/next/dist/docs/` before large framework changes.

---

## UX audit — test.cerheranails.com (2026-10-24 evening)

**Audited:** home, shop, PDPs (Cherry Mist, Moonlit Blush), cart (add-to-bag), size chart, how to apply, care, shipping, returns, privacy, admin login.

**Site health:** Layout/CSS/nav work. Brand “Cerhera Nails” consistent. Catalog loads from test Supabase. **Not a broken-chrome problem** — gaps are press-on commerce content and attributes.

### Test checkout?

**No.** Cart and “Checkout with Stripe” UI work, but a real Stripe session was **not** completed.

Blocked by handoff items still open:
1. Edge Functions not deployed on self-hosted Supabase (volumes still stock `main` + `hello`)
2. No Stripe test keys / webhook on `api.cerheranails.com` (or api-test)

Until those land, clicking Checkout will fail or hang at the Edge Function call. After deploy: smoke-test with card `4242 4242 4242 4242`.

### P0 — must fix for nail buyers

| # | Improvement | Why | Technical sketch |
|---|-------------|-----|------------------|
| 1 | **Shape + length** on PDP + shop cards | Dealbreaker attributes; currently buried in prose or missing | Migration: `products.shape`, `products.length` (text/enums); show badges; admin form fields |
| 2 | **Shop filters** by shape/length (finish optional) | Scanning PDPs to discover shape kills conversion | Client filters on shop (extend `ShopCatalog`) or query params |
| 3 | **Replace wrong Unsplash / non-nail card images** | Petal Lattice / some cards look like makeup tools or process shots | Upload real photos to Storage; fix `product_images` |
| 4 | **PDP gallery (4+ shots)** | Need on-hand, flat-lay of 10 nails, macro, side angle | Multiple `product_images`; gallery UI |
| 5 | **What’s included** on PDP | Tabs vs glue, file, wipe, etc. | `products.kit_includes` text/jsonb or markdown bullets |
| 6 | **Wear time** on PDP | Top FAQ for press-ons | `products.wear_notes` or structured tabs vs glue strings |
| 7 | **Exact free-shipping $** on cart + shipping page | Copy currently vague (“threshold set in the shop”) | Read `site_settings.free_shipping_threshold_cents`; show `$X` + cart progress bar |

### P1 — high conversion impact

| # | Improvement | Technical sketch |
|---|-------------|------------------|
| 8 | Finish type (glossy/matte/shimmer) as field | `products.finish` |
| 9 | Application time / beginner-friendly badge | Copy field or static “~10 min” from how-to page on PDP |
| 10 | Reusability + damage-free claims | Hero + PDP bullets |
| 11 | Size chart: mm table + measure diagram | Content page + optional image asset |
| 12 | Reviews / UGC (even manual first) | Later: Judge.me/Loox or simple `reviews` table |
| 13 | Cart: trust line, ETA window, free-ship progress | CartView + settings |
| 14 | Cross-sell (glue/oil) on cart | Optional products or static upsell |
| 15 | Related styles on PDP | Query by shape/finish |
| 16 | How-to short video embed | Content / PDP link |

### P2 — polish

Email capture, Instagram/UGC grid, FAQ accordion, occasion collections, sizing sample kit SKU, search, wishlist, promo code field (needs Stripe coupons + function support), gift cards.

### Schema suggestion (when implementing P0)

```text
products += shape text, length text, finish text,
            wear_notes text, kit_includes text,
            application_notes text  -- optional
```

Seed from existing description phrases (“short almond”, “medium coffin”) then clean in admin.

---

## Suggested next steps for the next agent

1. Finish Cloudflare Pages (`cerhera-nail`): GitHub app authorization, env vars, custom domains, verify
2. Configure real SMTP on prod, verify magic-link login for both admins (users + `public.admins` rows already exist)
3. **Deploy Edge Functions + Stripe test keys on pi-1; smoke-test checkout with `4242…`** (unblocks “test checkout”)
4. Product attribute migration + shop filters + PDP badges (UX P0)
5. Replace Unsplash with real product photos; fix wrong card imagery
6. Surface free-shipping threshold $ on cart/shipping
7. DHCP reservation for pi-1; Always Use HTTPS
8. When ready, migrate to Supabase Cloud (checklist above)

---

## Chat / history crumbs (optional)

- Started from plan “Petal Press Store”; user renamed to Cerhera Nails
- Repo created under `nghiathanhle/cerhera-nail`
- User asked to traverse broken Pages site → root cause was missing CSS (`_next` 404 + uncompiled Tailwind), fixed in commits `693c47e` and `519754e`
- User asked what integrations are needed and how to set up Supabase/Stripe (answered; not yet executed with real keys)
- 2026-10-24: self-hosted Supabase on pi-1 (prod + test), Cloudflare Tunnel, domain cerheranails.com, test site at test.cerheranails.com, prod DB seeded, move to Cloudflare Pages started. User plans to test on pi-1 Supabase, then move to Supabase Cloud.
- 2026-10-24 evening: UX click-through of https://test.cerheranails.com/ — chrome OK; press-on attribute/content gaps recorded above. **No Stripe test checkout performed** (functions/Stripe not live yet).

Do not edit the original plan file at `~/.cursor/plans/petal_press_store_*.plan.md` unless the user asks.
