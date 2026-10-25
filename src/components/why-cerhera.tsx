import Link from "next/link";

const points = [
  {
    title: "Salon finish, at home",
    body: "Ready sets with a soft, ethereal finish — no appointment required.",
  },
  {
    title: "Reusable wear",
    body: "Gentle on natural nails when applied and removed with care.",
  },
  {
    title: "US shipping only",
    body: "Flat-rate shipping across the United States. Guest checkout with Stripe.",
  },
];

export function WhyCerhera() {
  return (
    <section className="border-y border-ink/8 bg-paper/55">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-xl">
          <p className="section-label">Why Cerhera</p>
          <h2 className="mt-3 font-display text-4xl lowercase text-ink md:text-5xl">
            Made for golden-hour hands
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/65 md:text-base">
            Press-ons that feel like a quiet luxury — simple to apply, whimsical
            to wear, shipping only within the US.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {points.map((point) => (
            <div key={point.title}>
              <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {point.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/how-to-apply/"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            How to apply
          </Link>
        </div>
      </div>
    </section>
  );
}
