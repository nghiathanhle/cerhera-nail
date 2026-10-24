# Cerhera Nail

Simple, elegant, whimsical storefront for ready-made press-on nail styles.

**Stack:** Next.js static export · GitHub Pages · Supabase (DB, Auth, Storage, Edge Functions) · Stripe Checkout  
**Shipping:** US only · **Checkout:** guest · **Admin:** magic-link allowlist

Live (after deploy): https://nghiathanhle.github.io/cerhera-nail/

## Why Edge Functions?

GitHub Pages only hosts static files. Checkout sessions, Stripe webhooks, and order writes run on **Supabase Edge Functions** (`create-checkout`, `stripe-webhook`, `order-status`).

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase env vars, the shop uses demo catalog data. Leave `NEXT_PUBLIC_BASE_PATH` unset locally.

## GitHub Pages deploy

Site URL: https://nghiathanhle.github.io/cerhera-nail/

### Current publish path (`gh-pages` branch)

Pages is set to the `gh-pages` branch (static `out/` build with base path `/cerhera-nail`). Redeploy locally:

```bash
$env:NEXT_PUBLIC_BASE_PATH="/cerhera-nail"
$env:NEXT_PUBLIC_SITE_URL="https://nghiathanhle.github.io/cerhera-nail"
npm run build
npx gh-pages -d out
```

### Optional: GitHub Actions

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) can deploy from Actions if you switch Pages → Source to **GitHub Actions** and add secrets:

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Admin allowlist |

## Supabase setup

1. Create a project and apply [`supabase/migrations`](supabase/migrations) + [`supabase/seed.sql`](supabase/seed.sql).
2. Auth → Email magic link. Redirect URLs:
   - `http://localhost:3000/admin/`
   - `https://nghiathanhle.github.io/cerhera-nail/admin/`
3. Deploy functions:

```bash
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase functions deploy create-checkout
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy order-status
```

4. Stripe webhook endpoint (Dashboard → Webhooks):

`https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`  
Event: `checkout.session.completed`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Next.js (no base path) |
| `npm run build` | Static export to `out/` |
| `npm run lint` | ESLint |

## Project layout

```
src/app/(store)/          Storefront pages
src/app/admin/            Client-side admin
supabase/migrations/      Schema + RLS
supabase/functions/       Stripe checkout + webhook
.github/workflows/        GitHub Pages deploy
```
