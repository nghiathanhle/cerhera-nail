import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/settings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader storeName={settings.store_name} />
      <main className="flex-1">{children}</main>
      <SiteFooter storeName={settings.store_name} />
    </div>
  );
}
