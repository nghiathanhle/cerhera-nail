import type { ProductWithImages, SiteSettings } from "./types";

export const demoSettings: SiteSettings = {
  id: 1,
  store_name: "Cerhera Nails",
  flat_shipping_cents: 595,
  free_shipping_threshold_cents: 7500,
};

export const demoProducts: ProductWithImages[] = [
  {
    id: "demo-cherry-mist",
    name: "Cherry Mist",
    slug: "cherry-mist",
    description:
      "Soft cherry gloss with a whisper of pearl. A ten-piece set for everyday whimsy — short almond shape, salon finish.",
    price_cents: 2800,
    compare_at_cents: 3400,
    stock: 24,
    active: true,
    featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: "img-1",
        product_id: "demo-cherry-mist",
        storage_path:
          "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80",
        alt: "Cherry Mist press-on nails",
        sort_order: 0,
      },
    ],
  },
  {
    id: "demo-moonlit-blush",
    name: "Moonlit Blush",
    slug: "moonlit-blush",
    description:
      "Dusty rose with a cool shimmer that catches lamplight. Medium coffin, gently curved.",
    price_cents: 3200,
    compare_at_cents: null,
    stock: 18,
    active: true,
    featured: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: "img-2",
        product_id: "demo-moonlit-blush",
        storage_path:
          "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&q=80",
        alt: "Moonlit Blush press-on nails",
        sort_order: 0,
      },
    ],
  },
  {
    id: "demo-garden-ink",
    name: "Garden Ink",
    slug: "garden-ink",
    description:
      "Deep ink tips fading into soft petal pink. Hand-painted floral accents on two accent nails.",
    price_cents: 3800,
    compare_at_cents: null,
    stock: 12,
    active: true,
    featured: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: "img-3",
        product_id: "demo-garden-ink",
        storage_path:
          "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=1200&q=80",
        alt: "Garden Ink press-on nails",
        sort_order: 0,
      },
    ],
  },
  {
    id: "demo-buttercream",
    name: "Buttercream Cloud",
    slug: "buttercream-cloud",
    description:
      "Warm cream base with tiny cloud dots. Short squoval for typing-friendly days.",
    price_cents: 2600,
    compare_at_cents: null,
    stock: 30,
    active: true,
    featured: false,
    sort_order: 4,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: "img-4",
        product_id: "demo-buttercream",
        storage_path:
          "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80",
        alt: "Buttercream Cloud press-on nails",
        sort_order: 0,
      },
    ],
  },
  {
    id: "demo-petal-lattice",
    name: "Petal Lattice",
    slug: "petal-lattice",
    description:
      "Sheer blush with delicate lattice lines in warm gold foil. Statement set, long stiletto.",
    price_cents: 4200,
    compare_at_cents: 4800,
    stock: 8,
    active: true,
    featured: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: "img-5",
        product_id: "demo-petal-lattice",
        storage_path:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
        alt: "Petal Lattice press-on nails",
        sort_order: 0,
      },
    ],
  },
  {
    id: "demo-seafoam",
    name: "Seafoam Whisper",
    slug: "seafoam-whisper",
    description:
      "Pale seafoam with a satin finish. Medium almond — quiet, coastal, a little dreamy.",
    price_cents: 3000,
    compare_at_cents: null,
    stock: 16,
    active: true,
    featured: false,
    sort_order: 6,
    created_at: new Date().toISOString(),
    product_images: [
      {
        id: "img-6",
        product_id: "demo-seafoam",
        storage_path:
          "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80",
        alt: "Seafoam Whisper press-on nails",
        sort_order: 0,
      },
    ],
  },
];
