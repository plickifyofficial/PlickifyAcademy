import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/home/page-hero";
import { LiveBatch } from "@/components/home/live-batch";
import { FeaturedCourse } from "@/components/home/featured-course";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { getPublishedBatches } from "@/lib/content-modules";
import { ctaDefaults, liveBatchDefaults, featuredDefaults } from "@/lib/content-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Batch } from "@/lib/types";
import { ProseContent } from "@/components/editor/prose-content";
import { renderContent } from "@/lib/rte";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/live-batch", {
    title: "Live Batch | Plickify Academy",
  });
}

export const revalidate = 60;

const STATUS_META: Record<Batch["status"], { label: string; className: string }> = {
  open: { label: "Open", className: "bg-green-600" },
  upcoming: { label: "Upcoming", className: "bg-blue-600" },
  ongoing: { label: "Ongoing", className: "bg-amber-500" },
  closed: { label: "Closed", className: "bg-zinc-500" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function LiveBatchPage() {
  const [liveBatch, cta, batches, featuredContent, featuredCourse, featuredBatch] = await Promise.all([
    getSiteContent("home.live_batch", liveBatchDefaults),
    getSiteContent("home.cta", ctaDefaults),
    getPublishedBatches(),
    getSiteContent("home.featured", featuredDefaults),
    (async () => {
      const supabase = createAdminClient();
      const { data } = await supabase.from("courses").select("*").eq("is_featured", true).eq("is_published", true).order("updated_at", { ascending: false }).limit(1);
      return data?.[0] ?? null;
    })(),
    (async () => {
      const supabase = createAdminClient();
      const { data } = await supabase.from("batches").select("*").eq("is_featured", true).eq("is_published", true).order("sort_order", { ascending: true }).limit(1);
      return data?.[0] ?? null;
    })(),
  ]);

  const open = batches.filter((b) => b.status === "open" || b.status === "ongoing");
  const upcoming = batches.filter((b) => b.status === "upcoming");

  return (
    <>
      <PageHero
        eyebrow="Live Batch"
        title="Learn Live in Real-Time Classes"
        subtitle="Live classes, class recordings, and practical support — all on one platform. Secure your seat now."
      />
      <LiveBatch content={liveBatch} batch={featuredBatch} />

      {/* Combined Upcoming Live Batch + Featured Course — connected to home.featured + home.live_batch */}
      <section className="px-4 py-16 sm:px-6 bg-gradient-to-b from-white via-brand-50/30 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-xl shadow-brand-100/60 sm:p-8 lg:p-10">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                {featuredContent.tagline}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
                {featuredContent.title}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
                {featuredCourse?.subtitle || featuredContent.description}
              </p>
            </div>
            <div className="mt-10">
              <FeaturedCourse content={featuredContent} course={featuredCourse} />
            </div>
          </div>
        </div>
      </section>

      {open.length > 0 && (
        <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                Open Batches
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
                এখনই ভর্তি হোন
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {open.map((b) => (
                <BatchCard key={b.id} batch={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                Coming Soon
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
                Upcoming Batches
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {upcoming.map((b) => (
                <BatchCard key={b.id} batch={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCta content={cta} />
    </>
  );
}

function BatchCard({ batch: b }: { batch: Batch }) {
  const meta = STATUS_META[b.status];
  const pct = Math.min(
    100,
    Math.round((b.seats_filled / Math.max(1, b.seats_total)) * 100),
  );
  const seatsLeft = Math.max(0, b.seats_total - b.seats_filled);
  const discount = Number(b.old_price) > Number(b.price) ? Math.round((1 - Number(b.price) / Number(b.old_price)) * 100) : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${meta.className}`}>
          {meta.label}
        </span>
        {b.is_featured && (
          <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
            FEATURED
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-bold text-zinc-900">{b.title}</h3>
      {b.description ? (
        <ProseContent html={renderContent(b.description)} className="mt-1.5 line-clamp-2 text-sm text-zinc-500" />
      ) : null}

      <div className="mt-4 space-y-2 text-sm text-zinc-600">
        {b.start_date && (
          <p className="flex items-center gap-2">
            <i className="fa-solid fa-calendar-days text-brand-600" />
            Starts: {formatDate(b.start_date)}
          </p>
        )}
        {b.duration && (
          <p className="flex items-center gap-2">
            <i className="fa-solid fa-hourglass-half text-brand-600" />
            Duration: {b.duration}
          </p>
        )}
        {b.schedule && (
          <p className="flex items-center gap-2">
            <i className="fa-solid fa-clock text-brand-600" />
            {b.schedule}
          </p>
        )}
        {b.class_count > 0 && (
          <p className="flex items-center gap-2">
            <i className="fa-solid fa-video text-brand-600" />
            {b.class_count} Live Classes
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs font-medium text-zinc-500">
          <span>
            {seatsLeft > 0 ? `${seatsLeft} seats left` : "Seats full"}
          </span>
          <span>
            {b.seats_filled} / {b.seats_total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-brand-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {b.features && b.features.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {b.features.slice(0, 5).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
              <i className="fa-solid fa-circle-check text-xs text-brand-600" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex items-end justify-between border-t border-zinc-100 pt-4">
        <div>
          <span className="text-xl font-extrabold text-brand-600">
            ৳{Number(b.price).toLocaleString("en-IN")}
          </span>
          {Number(b.old_price) > Number(b.price) && (
            <>
              <span className="ml-1 text-sm text-zinc-400 line-through">
                ৳{Number(b.old_price).toLocaleString("en-IN")}
              </span>
              {discount > 0 && (
                <span className="ml-1 rounded bg-red-600/10 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
                  {discount}% OFF
                </span>
              )}
            </>
          )}
        </div>
        {b.status !== "closed" ? (
          <Link
            href={b.meeting_info || "/courses"}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Enroll Now
          </Link>
        ) : (
          <span className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-500">
            Closed
          </span>
        )}
      </div>
    </div>
  );
}