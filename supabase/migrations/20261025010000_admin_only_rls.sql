-- Restrict catalog writes and order access to public.admins.
--
-- The initial migration let every authenticated user insert, update, and
-- delete products, product_images, and site_settings, write the
-- product-images bucket, and read and update orders. NEXT_PUBLIC_ADMIN_EMAILS
-- is only a client check (src/lib/env.ts).
--
-- Public reads stay as they are: site_settings, active products, images of
-- active products, and objects in the public product-images bucket.
-- Inactive products and every product image are visible to admins only,
-- which is what the admin dashboard selects.
--
-- create-checkout, stripe-webhook, and order-status call Postgres with the
-- service role, which bypasses RLS. They can still read prices and stock,
-- insert orders and order_items, and decrement stock without an admin row.
--
-- Seed admins as postgres (or the service role) after the auth users exist.
-- Do not put a password in this statement. An empty admins table means no
-- authenticated user can write the catalog or read orders. On prod both
-- auth users already exist:
--
--   insert into public.admins (user_id)
--   select id from auth.users
--   where email in (
--     'nghiathanhle.25@gmail.com',
--     'angela.nguyen646@gmail.com'
--   );

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Operators who may manage the catalog and fulfill orders. Seed as postgres or service_role; the API roles have no policies.';

alter table public.admins enable row level security;

revoke all on table public.admins from PUBLIC, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

comment on function public.is_admin() is
  'True when auth.uid() is in public.admins. Security definer so policies can check membership without granting read on admins.';

revoke all on function public.is_admin() from PUBLIC;
grant execute on function public.is_admin() to authenticated;

-- Replace the permissive authenticated policies from the initial migration.
drop policy "Authenticated read all products" on public.products;
drop policy "Authenticated insert products" on public.products;
drop policy "Authenticated update products" on public.products;
drop policy "Authenticated delete products" on public.products;

drop policy "Authenticated read all product images" on public.product_images;
drop policy "Authenticated insert product images" on public.product_images;
drop policy "Authenticated update product images" on public.product_images;
drop policy "Authenticated delete product images" on public.product_images;

drop policy "Authenticated update site settings" on public.site_settings;

drop policy "Authenticated read orders" on public.orders;
drop policy "Authenticated update orders" on public.orders;
drop policy "Authenticated read order items" on public.order_items;

drop policy "Authenticated upload product images" on storage.objects;
drop policy "Authenticated update product images" on storage.objects;
drop policy "Authenticated delete product images" on storage.objects;

create policy "Admins read all products"
  on public.products for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins insert products"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins update products"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));

create policy "Admins read all product images"
  on public.product_images for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins insert product images"
  on public.product_images for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins update product images"
  on public.product_images for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete product images"
  on public.product_images for delete
  to authenticated
  using ((select public.is_admin()));

create policy "Admins update site settings"
  on public.site_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins read orders"
  on public.orders for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins update orders"
  on public.orders for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins read order items"
  on public.order_items for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (select public.is_admin())
  );

create policy "Admins update product image files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'product-images'
    and (select public.is_admin())
  );

create policy "Admins delete product image files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.is_admin())
  );
