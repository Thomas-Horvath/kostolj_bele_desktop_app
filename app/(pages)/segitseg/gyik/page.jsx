import InfoPage from "@/app/components/InfoPage";
import { siteContent } from "@/lib/siteContent";

export const metadata = {
  title: "GYIK | Kóstolj Bele!",
};

export default function Page() {
  return <InfoPage {...siteContent.faq} />;
}
