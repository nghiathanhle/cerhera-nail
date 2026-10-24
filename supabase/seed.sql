-- Seed placeholder styles (Unsplash URLs work without Storage uploads)

insert into public.products (name, slug, description, price_cents, compare_at_cents, stock, active, featured, sort_order)
values
  (
    'Cherry Mist',
    'cherry-mist',
    'Soft cherry gloss with a whisper of pearl. A ten-piece set for everyday whimsy — short almond shape, salon finish.',
    2800,
    3400,
    24,
    true,
    true,
    1
  ),
  (
    'Moonlit Blush',
    'moonlit-blush',
    'Dusty rose with a cool shimmer that catches lamplight. Medium coffin, gently curved.',
    3200,
    null,
    18,
    true,
    true,
    2
  ),
  (
    'Garden Ink',
    'garden-ink',
    'Deep ink tips fading into soft petal pink. Hand-painted floral accents on two accent nails.',
    3800,
    null,
    12,
    true,
    true,
    3
  ),
  (
    'Buttercream Cloud',
    'buttercream-cloud',
    'Warm cream base with tiny cloud dots. Short squoval for typing-friendly days.',
    2600,
    null,
    30,
    true,
    false,
    4
  ),
  (
    'Petal Lattice',
    'petal-lattice',
    'Sheer blush with delicate lattice lines in warm gold foil. Statement set, long stiletto.',
    4200,
    4800,
    8,
    true,
    true,
    5
  ),
  (
    'Seafoam Whisper',
    'seafoam-whisper',
    'Pale seafoam with a satin finish. Medium almond — quiet, coastal, a little dreamy.',
    3000,
    null,
    16,
    true,
    false,
    6
  );

insert into public.product_images (product_id, storage_path, alt, sort_order)
select p.id, v.url, v.alt, v.sort_order
from public.products p
join (
  values
    ('cherry-mist', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80', 'Cherry Mist press-on nails', 0),
    ('cherry-mist', 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=1200&q=80', 'Cherry Mist detail', 1),
    ('moonlit-blush', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&q=80', 'Moonlit Blush press-on nails', 0),
    ('garden-ink', 'https://images.unsplash.com/photo-1607779097040-26e80aa78eec?w=1200&q=80', 'Garden Ink press-on nails', 0),
    ('buttercream-cloud', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80', 'Buttercream Cloud press-on nails', 0),
    ('petal-lattice', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80', 'Petal Lattice press-on nails', 0),
    ('seafoam-whisper', 'https://images.unsplash.com/photo-1610992015732-cb2bf055cdc2?w=1200&q=80', 'Seafoam Whisper press-on nails', 0)
) as v(slug, url, alt, sort_order)
  on p.slug = v.slug;
