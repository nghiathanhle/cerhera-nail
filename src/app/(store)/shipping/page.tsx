import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <ContentPage eyebrow="Delivery" title="Shipping">
      <p>
        Cerhera Nails currently ships within the United States only. Flat-rate
        shipping is calculated at checkout, with free shipping once you pass
        the threshold set in the shop.
      </p>
      <ul>
        <li>Processing: usually 1–3 business days</li>
        <li>Transit: about 3–7 business days after handoff</li>
        <li>You’ll receive tracking when your order ships</li>
      </ul>
      <p>
        International shipping isn’t available in this first version — we’ll
        expand carefully later.
      </p>
    </ContentPage>
  );
}
