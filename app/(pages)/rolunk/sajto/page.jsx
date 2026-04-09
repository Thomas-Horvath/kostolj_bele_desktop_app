import InfoPage from "@/app/components/InfoPage";
import { siteContent } from "@/lib/siteContent";

export const metadata = {
  title: "Sajtó | Kóstolj Bele!",
};

export default function Page() {
  return <InfoPage {...siteContent.press} />;
}
