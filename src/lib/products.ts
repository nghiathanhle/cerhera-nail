import { createClient } from "@supabase/supabase-js";
import { demoProducts } from "./demo-data";
import { hasSupabaseEnv } from "./env";
import type { ProductWithImages } from "./types";

const productSelect = `
  id,
  name,
  slug,
  description,
  price_cents,
  compare_at_cents,
  stock,
  active,
  featured,
  sort_order,
  created_at,
  product_images (
    id,
    product_id,
    storage_path,
    alt,
    sort_order
  )
`;

function sortImages(products: ProductWithImages[]): ProductWithImages[] {
  return products.map((p) => ({
    ...p,
    product_images: [...(p.product_images || [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  }));
}

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function getActiveProducts(options?: {
  featuredOnly?: boolean;
}): Promise<ProductWithImages[]> {
  if (!hasSupabaseEnv()) {
    const list = demoProducts.filter((p) => p.active);
    return options?.featuredOnly ? list.filter((p) => p.featured) : list;
  }

  try {
    const supabase = publicClient();
    let query = supabase
      .from("products")
      .select(productSelect)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (options?.featuredOnly) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query;
    if (error || !data?.length) {
      return demoProducts.filter((p) =>
        options?.featuredOnly ? p.featured : true,
      );
    }

    return sortImages(data as ProductWithImages[]);
  } catch {
    return demoProducts.filter((p) =>
      options?.featuredOnly ? p.featured : true,
    );
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv()) {
    return demoProducts.find((p) => p.slug === slug) || null;
  }

  try {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      return demoProducts.find((p) => p.slug === slug) || null;
    }

    return sortImages([data as ProductWithImages])[0];
  } catch {
    return demoProducts.find((p) => p.slug === slug) || null;
  }
}
