import Link from "next/link";
import type { LiveBatchContent } from "@/lib/content-schema";
import type { Batch } from "@/lib/types";
import { Countdown } from "@/components/home/countdown";

export function LiveBatch({
  content,
  batch,
}: {
  content: LiveBatchContent;
  batch?: Batch | null;
}) {
  const deadline =
    batch?.start_date || (content.deadline ? content.deadline : null);
  const target = deadline ? new Date(deadline).getTime() : NaN;
  const seatsFilled = batch?.seats_filled ?? content.seatsFilled ?? 0;
  const seatsTotal = batch?.seats_total ?? content.seatsTotal ?? 1;
  const checks =
    batch?.features && batch.features.length > 0
      ? batch.features
      : content.checks;
  const buttonLink = batch ? "/live-batch" : content.buttonLink;
  const pct = Math.min(
    100,
    Math.round(((seatsFilled || 0) / (seatsTotal || 1)) * 100),
  );

  return (
    <section id="live-batch" className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div
          className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 shadow-2xl shadow-brand-700/40 sm:p-12 lg:grid-cols-2"
          data-aos="zoom-in"
        >
          <div>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-brand-600 shadow-lg">
              <i className="fa-solid fa-calendar-days" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
              {content.eyebrow}
            </p>
            <h2 className="mt-2 section-heading font-extrabold text-white">
              {batch?.title || content.title}
            </h2>
            <ul className="mt-6 space-y-2.5">
              {checks.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-sm font-medium text-white/90">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <i className="fa-solid fa-check text-[10px] text-white" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-6 lg:items-end">
            {!isNaN(target) && <Countdown target={target} />}

            <div className="w-full max-w-sm">
              <div className="mb-2 flex justify-between text-xs font-medium text-white/90">
                <span>{content.seatLabel}</span>
                <span>
                  {seatsFilled} / {seatsTotal}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <Link
              href={buttonLink || "/signup"}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
            >
              {content.buttonText}
              <i className="fa-solid fa-arrow-right text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
