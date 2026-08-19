"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsletterSubscriber } from "@/lib/types";
import {
  toggleSubscriber,
  deleteSubscriber,
} from "@/lib/actions/newsletter";
import { useToast } from "@/components/ui/toaster";

export function NewsletterTable({
  items,
}: {
  items: NewsletterSubscriber[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((s) => {
      if (status !== "All" && s.status !== status) return false;
      if (q && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, status]);

  const activeCount = items.filter((s) => s.status === "active").length;
  const unsubCount = items.filter((s) => s.status === "unsubscribed").length;

  async function run(
    fn: () => Promise<{ success?: boolean; error?: string } | undefined>,
    msg: string,
  ) {
    const res = await fn();
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(msg);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="wp-input !w-64"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="wp-input !w-auto"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#646970]">
          <span className="wp-tag wp-tag-green">{activeCount} Active</span>
          <span className="wp-tag wp-tag-gray">{unsubCount} Unsubscribed</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No subscribers found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-[#1d2327]">{s.email}</td>
                  <td>
                    {s.source ? (
                      <span className="wp-tag wp-tag-gray">{s.source}</span>
                    ) : (
                      <span className="text-xs text-[#8c8f94]">—</span>
                    )}
                  </td>
                  <td>
                    <span className="text-xs text-[#646970]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        run(
                          () =>
                            toggleSubscriber(
                              s.id,
                              s.status === "active" ? "unsubscribed" : "active",
                            ),
                          "Updated.",
                        )
                      }
                      className={`wp-tag border-0 ${s.status === "active" ? "wp-tag-green" : "wp-tag-gray"}`}
                    >
                      {s.status}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (confirm("Delete this subscriber?"))
                          run(() => deleteSubscriber(s.id), "Deleted.");
                      }}
                      className="wp-btn-link text-[#b32d2e] hover:text-[#8a1e1e]"
                    >
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}