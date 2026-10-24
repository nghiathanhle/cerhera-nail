import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Care" };

export default function CarePage() {
  return (
    <ContentPage eyebrow="Keep them lovely" title="Care tips">
      <p>
        Treat press-ons like a favorite ring — gentle with edges, kind with
        water, and they’ll last through soft weeks of everyday life.
      </p>
      <h2>Wear</h2>
      <ul>
        <li>Use gloves for dishes and cleaning when you can.</li>
        <li>Pat dry after washing — don’t pry under the free edge.</li>
        <li>A drop of cuticle oil keeps the look polished.</li>
      </ul>
      <h2>Removal</h2>
      <ul>
        <li>Soak in warm soapy water or use cuticle oil around the edges.</li>
        <li>Gently lift — never force or peel aggressively.</li>
        <li>Buff residue lightly and moisturize after.</li>
      </ul>
    </ContentPage>
  );
}
