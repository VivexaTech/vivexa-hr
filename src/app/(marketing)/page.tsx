import { HomePage } from "@/components/marketing/home-page";
import { JsonLd } from "@/components/marketing/json-ld";
import { faqs } from "@/constants/faq";
import { brand } from "@/constants/brand";
import { createMetadata, faqSchema } from "@/lib/seo";
import { getPublicPlans } from "@/lib/services/plans";

export const metadata = createMetadata({
  title: brand.productName,
  description: brand.description,
  path: "/",
});

export default async function Page() {
  const plans = await getPublicPlans();
  return (
    <>
      <JsonLd data={faqSchema(faqs.slice(0, 5))} />
      <HomePage plans={plans} />
    </>
  );
}
