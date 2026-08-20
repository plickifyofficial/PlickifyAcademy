"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogCategory, BlogPost } from "@/lib/types";
import {
  deletePost,
  duplicatePost,
  togglePost,
} from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";
import { formatBlogDate } from "@/lib/blog-utils";

export function PostsManager({
  items,
  categories,
}: {
  items: BlogPost[];
  categories: BlogCategory[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return `${p.title} ${p.excerpt ?? ""} ${(p.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }, [items, search, statusFilter]);

  const categoryName = (p: BlogPost) =>
    categories.find((c) => c.id === p.category_id)?.name ?? "—";

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="wp-input !w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="wp-input !w-auto"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <Link href="/admin/blog/posts/new" className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> New Post
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No posts found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Views</th>
                <th>Status</th>
                <th>Badges</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/admin/blog/posts/${p.id}/edit`}
                      className="font-medium text-[#1d2327] hover:text-[#2271b1]"
                    >
                      {p.title}
                    </Link>
                    <p className="max-w-[260px] truncate text-xs text-[#646970]">
                      /blog/{p.slug}
                    </p>
                  </td>
                  <td>
                    <span className="text-sm text-[#3c434a]">{categoryName(p)}</span>
                  </td>
                  <td>
                    <span className="text-sm text-[#646970]">{p.view_count ?? 0}</span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        run(() => togglePost(p.id, "is_published"), "Updated.")
                      }
                      className={`wp-tag border-0 ${
                        p.status === "published"
                          ? "wp-tag-green"
                          : p.status === "scheduled"
                            ? "wp-tag-blue"
                            : "wp-tag-gray"
                      }`}
                    >
                      {p.status === "scheduled"
                        ? `Scheduled · ${formatBlogDate(p.scheduled_at)}`
                        : p.status}
                    </button>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.is_featured && <span className="wp-tag wp-tag-blue">Featured</span>}
                      {p.is_popular && <span className="wp-tag wp-tag-blue">Popular</span>}
                      {p.is_trending && <span className="wp-tag wp-tag-blue">Trending</span>}
                      {p.is_editors_pick && <span className="wp-tag wp-tag-blue">Editor&apos;s Pick</span>}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-[#646970]">
                      {formatBlogDate(p.published_at)}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/blog/posts/${p.id}/edit`}
                      className="wp-btn-link"
                    >
                      <i className="fa-solid fa-pen" /> Edit
                    </Link>
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="wp-btn-link ml-2"
                    >
                      <i className="fa-solid fa-eye" /> View
                    </Link>
                    <button
                      onClick={() => run(() => duplicatePost(p.id), "Duplicated.")}
                      className="wp-btn-link ml-2"
                    >
                      <i className="fa-solid fa-copy" /> Duplicate
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this post?"))
                          run(() => deletePost(p.id), "Deleted.");
                      }}
                      className="wp-btn-link ml-2 text-[#b32d2e] hover:text-[#8a1e1e]"
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