-- Cerhera Nail initial schema

create extension if not exists "pgcrypto";

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Cerhera Nail',
  flat_shipping_cents integer not null default 595,
  free_shipping_threshold_cents integer default 7500
);

insert into public.site_settings (id) values (1);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  compare_at_cents integer check (compare_at_cents is null or compare_at_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order integer not null default 0
);

create index product_images_product_id_idx on public.product_images (product_id);

create type public.order_status as enum ('pending', 'paid', 'shipped', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  email text not null,
  status public.order_status not null default 'pending',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_address jsonb,
  tracking_number text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- Storage bucket for product photos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- RLS
alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public read: settings always readable
create policy "Public read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Public read: active products
create policy "Public read active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

-- Authenticated can read all products (admin UI)
create policy "Authenticated read all products"
  on public.products for select
  to authenticated
  using (true);

create policy "Public read images of active products"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.active = true
    )
  );

create policy "Authenticated read all product images"
  on public.product_images for select
  to authenticated
  using (true);

-- Orders: no public access (service role / server only for writes)
-- Authenticated admins can read/update via server with service role for mutations;
-- allow authenticated select for admin dashboards
create policy "Authenticated read orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated read order items"
  on public.order_items for select
  to authenticated
  using (true);

-- Admin product mutations (allowlisted in app; RLS allows authenticated writes)
create policy "Authenticated insert products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Authenticated update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete products"
  on public.products for delete
  to authenticated
  using (true);

create policy "Authenticated insert product images"
  on public.product_images for insert
  to authenticated
  with check (true);

create policy "Authenticated update product images"
  on public.product_images for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete product images"
  on public.product_images for delete
  to authenticated
  using (true);

create policy "Authenticated update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

-- Storage policies
create policy "Public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Authenticated upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Authenticated update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "Authenticated delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
