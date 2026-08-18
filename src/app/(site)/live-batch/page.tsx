import { PageHero } from "@/components/home/page-hero";
import { LiveBatch } from "@/components/home/live-batch";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, liveBatchDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "লাইভ ব্যাচ | Plickify Academy",
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
        title="লাইভ ক্লাসে সরাসরি শিখুন"
        subtitle="লাইভ ক্লাস, ক্লাস রেকর্ডিং ও প্র্যাকটিক্যাল সাপোর্ট — সব এক প্ল্যাটফর্মে। এখনই সিট নিশ্চিত করুন।"
      />
      <LiveBatch content={liveBatch} />
      <FinalCta content={cta} />
    </>
  );
}
