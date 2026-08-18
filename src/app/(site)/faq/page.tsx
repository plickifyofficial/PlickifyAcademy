import { PageHero } from "@/components/home/page-hero";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, faqPageDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "FAQ | Plickify Academy",
};

export const revalidate = 60;

export default async function FaqPage() {
  const [content, cta] = await Promise.all([
    getSiteContent("page.faq", faqPageDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero eyebrow="FAQ" title={content.title} subtitle={content.intro} />
      <Faq content={{ title: content.title, items: content.items }} />
      <FinalCta content={cta} />
    </>
  );
}