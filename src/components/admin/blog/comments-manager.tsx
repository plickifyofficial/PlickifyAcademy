"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogComment } from "@/lib/types";
import {
  moderateBlogComment,
  deleteBlogComment,
} from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";
import { formatBlogDate } from "@/lib/blog-utils";

export function CommentsManager({
  items,
  postTitles,
}: {
  items: BlogComment[];
  postTitles: Record<string, string>;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "spam" | "reported">(
    "all",
  );

  const filtered = useMemo(
    () =>
      items.filter((c) => {
        if (filter === "reported") return c.is_reported;
        if (filter === "all") return true;
        return c.status === filter;
      }),
    [items, filter],
  );

  const counts = useMemo(() => {
    const c = { all: items.length, pending: 0, approved: 0, rejected: 0, spam: 0, reported: 0 };
    for (const it of items) {
      if (it.status in c) c[it.status as keyof typeof c]++;
      if (it.is_reported) c.reported++;
    }
    return c;
  }, [items]);

  const tabs = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
    { key: "spam", label: `Spam (${counts.spam})` },
    { key: "reported", label: `Reported (${counts.reported})` },
  ] as const;

  async function moderate(id: string, status: string) {
    const res = await moderateBlogComment(
      id,
      status as "approved" | "rejected" | "spam",
    );
    if (res?.error) return showToast(res.error, "error");
    showToast("Comment updated.");
    router.refresh();
  }

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    spam: "bg-zinc-200 text-zinc-600",
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === t.key
                ? "bg-[#2271b1] text-white"
                : "bg-[#f0f0f1] text-[#3c434a] hover:bg-[#dcdcde]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No comments here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="wp-panel">
              <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#1d2327]">
                      {c.name || "Guest"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[c.status] ?? "bg-zinc-100 text-zinc-600"}`}
                    >
                      {c.status}
                    </span>
                    {c.is_reported && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                        <i className="fa-solid fa-flag mr-1" />
                        {c.report_count ?? 0} report(s)
                      </span>
                    )}
                    <span className="text-xs text-[#8c8f94]">
                      {formatBlogDate(c.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#646970]">
                    On: <span className="font-medium">{postTitles[c.post_id] ?? "Post"}</span>
                    {c.parent_id ? " · reply" : ""}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#3c434a]">
                    {c.body}
                  </p>
                  {c.email && (
                    <p className="mt-1 text-xs text-[#8c8f94]">{c.email}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {c.status !== "approved" && (
                    <button
                      onClick={() => void moderate(c.id, "approved")}
                      className="wp-btn-link text-emerald-700"
                    >
                      <i className="fa-solid fa-check" /> Approve
                    </button>
                  )}
                  {c.status !== "rejected" && (
                    <button
                      onClick={() => void moderate(c.id, "rejected")}
                      className="wp-btn-link"
                    >
                      <i className="fa-solid fa-xmark" /> Reject
                    </button>
                  )}
                  {c.status !== "spam" && (
                    <button
                      onClick={() => void moderate(c.id, "spam")}
                      className="wp-btn-link"
                    >
                      <i className="fa-solid fa-biohazard" /> Mark Spam
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this comment permanently?")) return;
                      const res = await deleteBlogComment(c.id);
                      if (res?.error) return showToast(res.error, "error");
                      showToast("Deleted.");
                      router.refresh();
                    }}
                    className="wp-btn-link text-[#b32d2e]"
                  >
                    <i className="fa-solid fa-trash" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}