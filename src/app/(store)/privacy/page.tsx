import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Trust" title="Privacy">
      <p>
        Cerhera Nails collects what we need to fulfill orders: your email,
        shipping address, and payment details processed by Stripe. We don’t sell
        your personal information.
      </p>
      <h2>What we store</h2>
      <ul>
        <li>Order records and shipping details in our database</li>
        <li>Payment confirmation via Stripe (we never see full card numbers)</li>
        <li>Optional analytics cookies if enabled later</li>
      </ul>
      <p>
        Questions about your data? Reach out and we’ll help promptly.
      </p>
    </ContentPage>
  );
}
