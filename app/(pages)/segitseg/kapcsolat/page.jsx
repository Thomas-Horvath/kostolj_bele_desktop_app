import InfoPage from "@/app/components/InfoPage";
import { siteContent } from "@/lib/siteContent";

export const metadata = {
  title: "Kapcsolatfelvétel | Kóstolj Bele!",
};

export default function Page() {
  return <InfoPage {...siteContent.contact} />;
}
