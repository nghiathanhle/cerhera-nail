# Cerhera Nails — Agent Handoff

Last updated: 2026-10-24 (America/New_York)

Use this document to continue work without re-discovering context. Prefer this over reconstructing history from chat.

---

## What this project is

E‑commerce storefront for **Cerhera Nails** (press-on nail styles).

| Item | Value |
|------|--------|
| Brand | **Cerhera Nails** (plural — not “Cerhera Nail” / not “Petal Press”) |
| Live site | https://nghiathanhle.github.io/cerhera-nail/ |
| GitHub repo | https://github.com/nghiathanhle/cerhera-nail |
| Default branch | `main` |
| Pages branch | `gh-pages` (static export of `out/`) |
| Local folder (original) | `C:\Users\nghia\Cursor\petal-press` (Windows); cloud workspace may be `/workspace` |
| npm package name | still `petal-press` (folder/legacy); brand is Cerhera Nails |

---

## Product decisions (v1 locked)

- Style-based ready sets (no made-to-order sizing flow yet)
- US shipping only; flat rate from `site_settings`
- Guest checkout via Stripe Checkout (hosted)
- No customer accounts
- Light admin (magic-link email allowlist) for styles + order fulfillment
- Stack: Next.js **static export** + GitHub Pages + Supabase + Stripe

Placeholder brand was “Petal Press”; renamed to Cerhera Nails. User may rename again later via `site_settings.store_name` + metadata.

---

## Architecture (important)

GitHub Pages serves **static files only**. There is no Next.js server on Pages.

```
Browser (static Next.js)
  → Supabase Postgres/Storage/Auth (anon key)
  → Supabase Edge Functions
       create-checkout  → Stripe Checkout Session
       stripe-webhook   ← Stripe events (service role writes orders)
       order-status     → poll order after redirect
```

Do **not** add Next.js API routes / Server Actions expecting them to work on Pages. Backend must stay on Supabase Edge Functions (or another external host).

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
.github/workflows/deploy.yml  Optional Actions deploy (Pages currently uses gh-pages branch)
public/.nojekyll          Required for Pages (underscore folders)
postcss.config.mjs        @tailwindcss/postcss — required for CSS to compile
```

### Key files

| File | Role |
|------|------|
| `next.config.ts` | `output: 'export'`, `trailingSlash`, `basePath`/`assetPrefix` from `NEXT_PUBLIC_BASE_PATH` |
| `src/lib/demo-data.ts` | Fallback catalog when Supabase env missing |
| `src/lib/products.ts` | Reads active products (Supabase anon or demo) |
| `src/lib/functions.ts` | Calls Edge Functions with anon key |
| `src/components/cart-view.tsx` | Checkout → `create-checkout` |
| `src/components/admin-dashboard.tsx` | Client CRUD + orders |
| `.env.example` | Public env + comments for function secrets |

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

### Not done / blocked on user credentials

- [ ] Create real Supabase project and apply migration + seed
- [ ] Deploy Edge Functions + set secrets
- [ ] Create Stripe account (test) + webhook to `stripe-webhook` function
- [ ] Set `NEXT_PUBLIC_*` for production build and redeploy Pages
- [ ] Set `NEXT_PUBLIC_ADMIN_EMAILS` and verify admin magic link
- [ ] Real product photos (still Unsplash placeholders)
- [ ] Optional: switch Pages to GitHub Actions deploy; add Actions secrets
- [ ] Rename npm package / cart storage key from `petal-press` if desired
- [ ] Delete leftover remote branch `cursor/fix-gh-pages-nojekyll-9dc5` if unused

### Known pitfalls (do not regress)

1. **Always deploy with** `npm run deploy:pages` (uses `gh-pages -d out --dotfiles --nojekyll`). Without `.nojekyll`, GitHub Pages runs Jekyll and drops `_next/` → unstyled site.
2. **Bake public env into the static build.** Changing Supabase URL after deploy requires rebuild + redeploy.
3. **Local vs Pages:** leave `NEXT_PUBLIC_BASE_PATH` unset for `npm run dev`; set `/cerhera-nail` for Pages builds.
4. **Do not use Next API routes** for checkout/webhooks on this hosting model.
5. **Admin security:** allowlist is `NEXT_PUBLIC_ADMIN_EMAILS` (client-visible). RLS currently allows authenticated writes to products; tighten with an `admins` table / policy before production if needed.
6. **OAuth `workflow` scope:** early push of `.github/workflows` failed once; file exists on `main` now. Pages source is **legacy `gh-pages` branch**, not Actions, unless user switches it.

---

## Deploy commands (Pages)

```bash
# From repo root
export NEXT_PUBLIC_BASE_PATH=/cerhera-nail
export NEXT_PUBLIC_SITE_URL=https://nghiathanhle.github.io/cerhera-nail
# Optional if Supabase ready:
# export NEXT_PUBLIC_SUPABASE_URL=...
# export NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# export NEXT_PUBLIC_ADMIN_EMAILS=you@example.com

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

### Supabase

1. Create project → copy URL, anon key, service role key
2. Run migration SQL + `seed.sql`
3. Auth → Email magic link; redirect URLs:
   - `http://localhost:3000/admin/`
   - `https://nghiathanhle.github.io/cerhera-nail/admin/`
4. Link CLI and deploy functions (see README)
5. Secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Stripe

1. Test mode API secret key → Supabase secret
2. Webhook endpoint: `https://PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Event: `checkout.session.completed`
4. Signing secret → `STRIPE_WEBHOOK_SECRET`
5. No need to pre-create Stripe Products; line items built from DB prices

### Site env (build-time)

```
NEXT_PUBLIC_SITE_URL=https://nghiathanhle.github.io/cerhera-nail
NEXT_PUBLIC_BASE_PATH=/cerhera-nail
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ADMIN_EMAILS=...
```

---

## Data model (summary)

- `site_settings` (singleton id=1): `store_name`, `flat_shipping_cents`, `free_shipping_threshold_cents`
- `products`: name, slug, description, price_cents, stock, active, featured, sort_order
- `product_images`: `storage_path` may be full `https://` URL or Storage path under bucket `product-images`
- `orders` / `order_items`: written by webhook; statuses `pending|paid|shipped|cancelled`

---

## Design notes

- Soft blush / warm ink / paper background + grain (avoid purple SaaS / cream-terracotta clichés)
- Hero: brand-first, one headline, one CTA, full-bleed image
- Cards only where interaction needs them; storefront is not a dashboard
- Mobile-first

Next.js in this repo may differ from “classic” Next — see `AGENTS.md` / `node_modules/next/dist/docs/` before large framework changes.

---

## Suggested next steps for the next agent

1. With user credentials: wire Supabase + Stripe end-to-end; smoke-test checkout with `4242…`
2. Redeploy Pages with real `NEXT_PUBLIC_*` so catalog leaves demo mode
3. Harden admin RLS before real inventory
4. Replace Unsplash with real product photos via admin or Storage
5. If user wants CI deploys: enable Pages → GitHub Actions and fill Actions secrets

---

## Chat / history crumbs (optional)

- Started from plan “Petal Press Store”; user renamed to Cerhera Nails
- Repo created under `nghiathanhle/cerhera-nail`
- User asked to traverse broken Pages site → root cause was missing CSS (`_next` 404 + uncompiled Tailwind), fixed in commits `693c47e` and `519754e`
- User asked what integrations are needed and how to set up Supabase/Stripe (answered; not yet executed with real keys)

Do not edit the original plan file at `~/.cursor/plans/petal_press_store_*.plan.md` unless the user asks.
