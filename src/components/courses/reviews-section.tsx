"use client";

import { useState } from "react";
import { submitReview } from "@/lib/actions/learning";
import { useToast } from "@/components/ui/toaster";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

function Stars({
  value,
  onChange,
  size = "text-base",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={onChange ? "button" : undefined}
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`${size} ${onChange ? "cursor-pointer" : "cursor-default"} ${
            n <= value ? "text-amber-400" : "text-zinc-300"
          }`}
          aria-label={`${n} স্টার`}
        >
          <i className="fa-solid fa-star" />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({
  courseId,
  isEnrolled,
  reviews,
  avg,
  count,
  ownReview,
}: {
  courseId: string;
  isEnrolled: boolean;
  reviews: ReviewItem[];
  avg: number;
  count: number;
  ownReview: { rating: number; comment: string | null } | null;
}) {
  const [rating, setRating] = useState(ownReview?.rating ?? 0);
  const [comment, setComment] = useState(ownReview?.comment ?? "");
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      showToast("রেটিং দিন (১-৫ স্টার)", "error");
      return;
    }
    setPending(true);
    try {
      await submitReview(courseId, rating, comment);
      showToast("রিভিউ জমা হয়েছে");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "জমা দেওয়া যায়নি", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-900">
        রিভিউ ও রেটিং
        <span className="ml-2 align-middle text-base font-semibold text-zinc-500">
          <span className="text-amber-400">
            <i className="fa-solid fa-star" />
          </span>{" "}
          {avg > 0 ? avg.toFixed(1) : "—"} ({count}টি)
        </span>
      </h2>

      {isEnrolled && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5"
        >
          <p className="text-sm font-semibold text-zinc-800">
            {ownReview ? "আপনার রিভিউ আপডেট করুন" : "আপনার মতামত জানান"}
          </p>
          <div className="mt-2">
            <Stars value={rating} onChange={setRating} size="text-2xl" />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="কোর্সটি কেমন লাগলো?"
            className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-3 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "জমা হচ্ছে..." : ownReview ? "আপডেট করুন" : "রিভিউ জমা দিন"}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <p className="text-zinc-500">এখনো কোনো রিভিউ নেই।</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {(r.profiles?.full_name ?? "U").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-zinc-900">
                    {r.profiles?.full_name ?? "শিক্ষার্থী"}
                  </p>
                  <Stars value={r.rating} size="text-xs" />
                </div>
              </div>
              <span className="text-xs text-zinc-400">
                {new Date(r.created_at).toLocaleDateString("bn-BD")}
              </span>
            </div>
            {r.comment && (
              <p className="mt-3 text-sm text-zinc-600">{r.comment}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}