import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Size chart" };

export default function SizeChartPage() {
  return (
    <ContentPage eyebrow="Fit" title="Size chart">
      <p>
        Each Cerhera Nails set includes ten nails across common sizes. Match
        your natural nails to the chart below — if you’re between sizes, size up
        for comfort.
      </p>
      <h2>How to measure</h2>
      <ul>
        <li>Trace or measure the widest part of each nail bed.</li>
        <li>Compare to the tip sizes printed on your set’s card.</li>
        <li>Prefer a snug fit that doesn’t press the sidewalls.</li>
      </ul>
      <h2>Typical mapping</h2>
      <ul>
        <li>0–1 — thumbs</li>
        <li>2–4 — index / middle</li>
        <li>5–7 — ring</li>
        <li>8–9 — pinky</li>
      </ul>
      <p>
        Still unsure? Email a photo of your natural nails and we’ll help you
        pick before you order.
      </p>
    </ContentPage>
  );
}
