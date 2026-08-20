"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogSettingsContent } from "@/lib/content-schema";
import { saveBlogSettings } from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";

export function BlogSettingsForm({
  settings,
  categories,
  authors,
}: {
  settings: BlogSettingsContent;
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ ...settings });
  const [pending, setPending] = useState(false);

  function set<T extends keyof BlogSettingsContent>(key: T, value: BlogSettingsContent[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setPending(true);
    const res = await saveBlogSettings(JSON.stringify(form));
    setPending(false);
    if (res?.error) return showToast(res.error, "error");
    showToast("Blog settings saved.");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="wp-panel">
          <div className="wp-panel-header">Blog Settings</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="wp-label">Posts per page</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.postsPerPage}
                  onChange={(e) => set("postsPerPage", Number(e.target.value))}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Default Category</label>
                <select
                  value={form.defaultCategoryId ?? ""}
                  onChange={(e) => set("defaultCategoryId", (e.target.value || null) as never)}
                  className="wp-input"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wp-label">Default Author</label>
                <select
                  value={form.defaultAuthorId ?? ""}
                  onChange={(e) => set("defaultAuthorId", (e.target.value || null) as never)}
                  className="wp-input"
                >
                  <option value="">— None —</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="wp-label">SEO Title Template</label>
              <input
                value={form.seoTitleTemplate}
                onChange={(e) => set("seoTitleTemplate", e.target.value)}
                className="wp-input"
              />
              <p className="mt-1 text-xs text-[#646970]">
                {"Use {title} as placeholder, e.g. \"{title} | Plickify Academy Blog\"."}
              </p>
            </div>
            <div>
              <label className="wp-label">Pagination style</label>
              <select
                value={form.pagination}
                onChange={(e) => set("pagination", e.target.value as "load-more" | "pages")}
                className="wp-input"
              >
                <option value="load-more">Load more button</option>
                <option value="pages">Numbered pages</option>
              </select>
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">Features</div>
          <div className="wp-panel-body grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(
              [
                { key: "commentsEnabled", label: "Comments on articles" },
                { key: "shareButtons", label: "Share buttons" },
                { key: "relatedPosts", label: "Related posts" },
                { key: "showReadingTime", label: "Reading time" },
                { key: "showViewCounter", label: "View counter" },
                { key: "showNewsletter", label: "Newsletter signup" },
                { key: "showSidebar", label: "Blog sidebar" },
                { key: "showFeatured", label: "Featured section" },
              ] as const
            ).map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm text-[#3c434a]">
                <input
                  type="checkbox"
                  checked={form[opt.key] as boolean}
                  onChange={(e) => set(opt.key, e.target.checked as never)}
                  className="wp-checkbox"
                />
                {opt.label}
              </label>
            ))}
            <div>
              <label className="wp-label">Comment moderation</label>
              <select
                value={form.commentsModeration}
                onChange={(e) => set("commentsModeration", e.target.value as "manual" | "auto")}
                className="wp-input"
              >
                <option value="manual">Manual (approve in admin)</option>
                <option value="auto">Auto-approve</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="wp-panel self-start">
        <div className="wp-panel-header">Save</div>
        <div className="wp-panel-body flex flex-col gap-2">
          <button onClick={save} disabled={pending} className="wp-btn wp-btn-primary">
            <i className="fa-solid fa-floppy-disk" />
            {pending ? "Saving..." : "Save Settings"}
          </button>
          <a href="/blog" target="_blank" className="wp-btn text-center">
            <i className="fa-solid fa-eye" /> View Blog
          </a>
        </div>
      </div>
    </div>
  );
}