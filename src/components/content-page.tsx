export function ContentPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-petal">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{title}</h1>
      <div className="prose-petal mt-8">{children}</div>
    </article>
  );
}
