"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogTag } from "@/lib/types";
import {
  createBlogTag,
  deleteBlogTag,
  updateBlogTag,
} from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";
import { clientSlug } from "@/lib/blog-utils";

export function TagsManager({ items }: { items: BlogTag[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<BlogTag | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    if (!name.trim()) return showToast("Name is required.", "error");
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", name);
    fd.set("slug", slug || clientSlug(name));
    fd.set("description", description);
    const res = editing
      ? await updateBlogTag(fd)
      : await createBlogTag(fd);
    setPending(false);
    if (res?.error) return showToast(res.error, "error");
    showToast(editing ? "Tag updated." : "Tag created.");
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="wp-panel self-start">
        <div className="wp-panel-header">{editing ? `Edit "${editing.name}"` : "Add Tag"}</div>
        <div className="wp-panel-body grid grid-cols-1 gap-3">
          <div>
            <label className="wp-label">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from name"
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="wp-input min-h-[60px]"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={pending} className="wp-btn wp-btn-primary flex-1">
              {pending ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setSlug("");
                  setDescription("");
                }}
                className="wp-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="wp-panel lg:col-span-2">
        <div className="wp-panel-header">All Tags</div>
        <div className="overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td className="font-mono text-xs text-[#646970]">/{t.slug}</td>
                  <td className="max-w-[240px] truncate text-sm text-[#646970]">
                    {t.description || "—"}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setEditing(t);
                        setName(t.name);
                        setSlug(t.slug);
                        setDescription(t.description ?? "");
                      }}
                      className="wp-btn-link"
                    >
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete tag "${t.name}"?`)) return;
                        const res = await deleteBlogTag(t.id);
                        if (res?.error) return showToast(res.error, "error");
                        showToast("Deleted.");
                        router.refresh();
                      }}
                      className="wp-btn-link ml-2 text-[#b32d2e]"
                    >
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-sm text-[#646970]">
                    No tags yet. Tags can also be created from the post editor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}