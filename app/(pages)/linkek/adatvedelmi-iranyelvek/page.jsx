import InfoPage from "@/app/components/InfoPage";
import { siteContent } from "@/lib/siteContent";

export const metadata = {
  title: "Adatvédelmi Irányelvek | Kóstolj Bele!",
};

export default function Page() {
  return <InfoPage {...siteContent.privacy} />;
}
