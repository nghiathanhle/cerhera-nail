import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-paper">
      <div className="border-b border-ink/10 bg-foam/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin/" className="font-display text-xl text-ink">
              Admin
            </Link>
            <nav className="flex gap-4 text-sm text-ink/65">
              <Link href="/admin/" className="hover:text-ink">
                Dashboard
              </Link>
              <Link href="/" className="hover:text-ink">
                Storefront
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">{children}</div>
    </div>
  );
}
