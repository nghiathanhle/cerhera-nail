export function resolveImageUrl(storagePath: string): string {
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return storagePath;

  return `${base}/storage/v1/object/public/product-images/${storagePath}`;
}
