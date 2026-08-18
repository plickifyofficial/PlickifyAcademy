import { PageHero } from "@/components/home/page-hero";
import { LegalContent } from "@/components/home/legal-content";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, refundPageDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "Refund Policy | Plickify Academy",
};

export const revalidate = 60;

export default async function RefundPage() {
  const [content, cta] = await Promise.all([
    getSiteContent("page.refund", refundPageDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero eyebrow="Refund" title={content.title} subtitle={content.intro} />
      <LegalContent content={content} />
      <FinalCta content={cta} />
    </>
  );
}