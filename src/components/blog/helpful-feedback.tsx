"use client";

import { useState } from "react";
import { saveBlogFeedback } from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";

export function HelpfulFeedback({
  postId,
  counts,
  initial,
}: {
  postId: string;
  counts: { helpful: number; not_helpful: number };
  initial: "yes" | "no" | null;
}) {
  const { showToast } = useToast();
  const [choice, setChoice] = useState<"yes" | "no" | null>(initial);
  const [display, setDisplay] = useState(counts);
  const [pending, setPending] = useState(false);

  async function vote(value: "yes" | "no") {
    if (pending || choice === value) return;
    setPending(true);
    const res = await saveBlogFeedback(postId, value === "yes");
    setPending(false);
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    setChoice(value);
    setDisplay((d) => ({
      helpful: d.helpful + (value === "yes" ? 1 : 0),
      not_helpful: d.not_helpful + (value === "no" ? 1 : 0),
    }));
  }

  return (
    <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
      <p className="font-semibold text-zinc-900">Was this article helpful?</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => vote("yes")}
          disabled={pending}
          className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
            choice === "yes"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-green-400"
          }`}
        >
          <i className="fa-regular fa-thumbs-up" /> Yes
          <span className="text-xs text-zinc-400">{display.helpful}</span>
        </button>
        <button
          type="button"
          onClick={() => vote("no")}
          disabled={pending}
          className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
            choice === "no"
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-red-400"
          }`}
        >
          <i className="fa-regular fa-thumbs-down" /> No
          <span className="text-xs text-zinc-400">{display.not_helpful}</span>
        </button>
      </div>
      {choice && (
        <p className="mt-3 text-xs text-zinc-500">Thanks for your feedback!</p>
      )}
    </div>
  );
}