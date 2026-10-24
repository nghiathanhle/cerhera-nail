import { ContentPage } from "@/components/content-page";

export const metadata = { title: "How to apply" };

export default function HowToApplyPage() {
  return (
    <ContentPage eyebrow="Ritual" title="How to apply">
      <p>
        A calm ten minutes is all it takes to wear your Cerhera Nails. Soft
        hands, clean nails, and a little patience — then you’re done.
      </p>
      <h2>Steps</h2>
      <ul>
        <li>Wash and fully dry your hands. Push cuticles back gently.</li>
        <li>Lightly buff the nail surface — no shine left, no heavy filing.</li>
        <li>Wipe with alcohol so oil doesn’t sneak under the tip.</li>
        <li>Select the best-fitting tip for each finger.</li>
        <li>Place an adhesive tab (or a thin gel glue bead) on the tip.</li>
        <li>Press on from cuticle to free edge for 20–30 seconds.</li>
        <li>File free edges to blend. Finish with cuticle oil if you like.</li>
      </ul>
      <p>
        Avoid water for about an hour after applying so everything settles in.
      </p>
    </ContentPage>
  );
}
