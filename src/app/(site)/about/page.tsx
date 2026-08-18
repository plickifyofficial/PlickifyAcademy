import { PageHero } from "@/components/home/page-hero";
import { WhyUs } from "@/components/home/why-us";
import { LearningProcess } from "@/components/home/learning-process";
import { Stats } from "@/components/home/stats";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import {
  ctaDefaults,
  processDefaults,
  statsDefaults,
  whyDefaults,
} from "@/lib/content-schema";

export const metadata = {
  title: "About Us | Plickify Academy",
};

export const revalidate = 60;

export default async function AboutPage() {
  const [why, process, stats, cta] = await Promise.all([
    getSiteContent("home.why", whyDefaults),
    getSiteContent("home.process", processDefaults),
    getSiteContent("home.stats", statsDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero
        eyebrow="About Plickify Academy"
        title="Our Story"
        subtitle="A practical learning platform for AI, Freelancing, and Digital Skills — where learning means real work and real income."
      />
      <WhyUs content={why} />
      <Stats content={stats} />
      <LearningProcess content={process} />
      <FinalCta content={cta} />
    </>
  );
}
