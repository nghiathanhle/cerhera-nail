import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/settings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-full flex-col">
      <SiteChrome
        storeName={settings.store_name}
        freeShippingThresholdCents={settings.free_shipping_threshold_cents}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter storeName={settings.store_name} />
    </div>
  );
}
