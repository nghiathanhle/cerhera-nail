export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
};

export type ProductWithImages = Product & {
  product_images: ProductImage[];
};

export type SiteSettings = {
  id: number;
  store_name: string;
  flat_shipping_cents: number;
  free_shipping_threshold_cents: number | null;
};

export type ShippingAddress = {
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

export type Order = {
  id: string;
  stripe_session_id: string;
  email: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  unit_price_cents: number;
  quantity: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};
