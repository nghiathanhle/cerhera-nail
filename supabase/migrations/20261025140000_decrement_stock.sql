-- Atomic stock decrement for the Stripe webhook.
-- The previous read-then-update could lose updates when two payments landed together.
-- Returns the remaining stock, or null when the product is missing or stock would go below qty.
-- Shoppers cannot call this: only service_role (the webhook) has execute.

create or replace function public.decrement_stock(product_id uuid, qty integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  remaining integer;
begin
  if qty is null or qty <= 0 then
    raise exception 'qty must be positive';
  end if;

  update public.products as p
  set stock = p.stock - decrement_stock.qty
  where p.id = decrement_stock.product_id
    and p.stock >= decrement_stock.qty
  returning p.stock into remaining;

  return remaining;
end;
$$;

comment on function public.decrement_stock(uuid, integer) is
  'Subtract qty from products.stock when enough remains. Null if the product is missing or stock would go negative. service_role only.';

revoke all on function public.decrement_stock(uuid, integer) from PUBLIC, anon, authenticated;
grant execute on function public.decrement_stock(uuid, integer) to service_role;
