import { ContentPage } from "@/components/content-page";

export const metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <ContentPage eyebrow="Peace of mind" title="Returns">
      <p>
        Because Cerhera Nails styles are wearable beauty goods, we can’t accept
        returns on opened sets. If something arrives damaged or incorrect, email
        us within 7 days with photos and we’ll make it right.
      </p>
      <ul>
        <li>Unopened sets may be eligible for exchange within 14 days</li>
        <li>Custom or final-sale notes (if any) will appear on the product page</li>
        <li>Buyer-paid return shipping unless we made a mistake</li>
      </ul>
    </ContentPage>
  );
}
