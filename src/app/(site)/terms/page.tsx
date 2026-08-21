import type { Metadata } from "next";
import { PageHero } from "@/components/home/page-hero";
import { LegalContent } from "@/components/home/legal-content";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, termsPageDefaults } from "@/lib/content-schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/terms", {
    title: "Terms & Conditions | Plickify Academy",
  });
}

export const revalidate = 60;

export default async function TermsPage() {
  const [content, cta] = await Promise.all([
    getSiteContent("page.terms", termsPageDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero eyebrow="Legal" title={content.title} subtitle={content.intro} />
      <LegalContent content={content} />
      <FinalCta content={cta} />
    </>
  );
}