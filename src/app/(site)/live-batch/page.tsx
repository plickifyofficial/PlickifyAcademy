import { PageHero } from "@/components/home/page-hero";
import { LiveBatch } from "@/components/home/live-batch";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, liveBatchDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "Live Batch | Plickify Academy",
};

export const revalidate = 60;

export default async function LiveBatchPage() {
  const [liveBatch, cta] = await Promise.all([
    getSiteContent("home.live_batch", liveBatchDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Live Batch"
        title="Learn Live in Real-Time Classes"
        subtitle="Live classes, class recordings, and practical support — all on one platform. Secure your seat now."
      />
      <LiveBatch content={liveBatch} />
      <FinalCta content={cta} />
    </>
  );
}
