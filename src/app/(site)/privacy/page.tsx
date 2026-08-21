import type { Metadata } from "next";
import { PageHero } from "@/components/home/page-hero";
import { LegalContent } from "@/components/home/legal-content";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, privacyPageDefaults } from "@/lib/content-schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/privacy", {
    title: "Privacy Policy | Plickify Academy",
  });
}

export const revalidate = 60;

export default async function PrivacyPage() {
  const [content, cta] = await Promise.all([
    getSiteContent("page.privacy", privacyPageDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero eyebrow="Privacy" title={content.title} subtitle={content.intro} />
      <LegalContent content={content} />
      <FinalCta content={cta} />
    </>
  );
}