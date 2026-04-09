import InfoPage from "@/app/components/InfoPage";
import { siteContent } from "@/lib/siteContent";

export const metadata = {
  title: "Csapatunk | Kóstolj Bele!",
};

export default function Page() {
  return <InfoPage {...siteContent.team} />;
}
