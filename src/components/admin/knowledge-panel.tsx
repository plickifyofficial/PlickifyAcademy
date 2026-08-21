"use client";

import { useState } from "react";
import { syncKnowledgeBaseAction } from "@/lib/actions/ai";

type Stats = {
  counts: Record<string, number>;
  total: number;
  syncedAt: string | null;
};

const SOURCE_META: { key: string; label: string; icon: string }[] = [
  { key: "courses", label: "Courses", icon: "fa-solid fa-graduation-cap" },
  { key: "lessons", label: "Lessons", icon: "fa-solid fa-book-open" },
  { key: "batches", label: "Live Batches", icon: "fa-solid fa-bolt" },
  { key: "products", label: "Digital Products", icon: "fa-solid fa-box-open" },
  { key: "blog", label: "Blog Posts", icon: "fa-solid fa-newspaper" },
  { key: "faq", label: "FAQ Entries", icon: "fa-solid fa-circle-question" },
  { key: "pages", label: "CMS Pages", icon: "fa-solid fa-file-lines" },
  { key: "policies", label: "Policies", icon: "fa-solid fa-scale-balanced" },
  { key: "custom_pages", label: "Custom Pages", icon: "fa-solid fa-file-circle-plus" },
];

export function KnowledgePanel({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setPending(true);
    setMessage(null);
    try {
      const res = await syncKnowledgeBaseAction();
      setStats((prev) => ({
        ...prev,
        counts: { ...prev.counts, ...res.counts },
        total: Object.values(res.counts).reduce((a, b) => a + b, 0),
        syncedAt: res.syncedAt,
      }));
      setMessage("Knowledge base synced — AI now has the latest content.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="wp-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">
            Knowledge Base ({stats.total} chunks)
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {stats.syncedAt
              ? `Last synced: ${new Date(stats.syncedAt).toLocaleString()}`
              : "Never synced. The base also auto-syncs when content changes."}
          </p>
        </div>
        <button onClick={handleSync} disabled={pending} className="wp-btn wp-btn-primary">
          <i className={pending ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-rotate"} />
          Sync Knowledge Base
        </button>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        {SOURCE_META.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <i className={s.icon} />
            </span>
            <div>
              <p className="text-sm font-bold text-zinc-800">
                {stats.counts[s.key] ?? 0}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="border-t border-zinc-100 px-5 py-3 text-[11px] leading-relaxed text-zinc-400">
        Draft / unpublished content never enters the knowledge base. When a course,
        product, batch, blog post or CMS section is edited, the knowledge base
        refreshes automatically on the next chat request.
      </p>

      {message && (
        <p className="border-t border-zinc-200 px-5 py-3 text-sm text-zinc-600">{message}</p>
      )}
    </div>
  );
}
