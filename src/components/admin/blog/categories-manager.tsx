"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogCategory } from "@/lib/types";
import {
  createBlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
} from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";
import { clientSlug } from "@/lib/blog-utils";

export function CategoriesManager({ items }: { items: BlogCategory[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    if (!name.trim()) return showToast("Name is required.", "error");
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", name);
    fd.set("slug", slug || clientSlug(name));
    fd.set("description", description);
    fd.set("sort_order", String(sortOrder));
    const res = editing
      ? await updateBlogCategory(fd)
      : await createBlogCategory(fd);
    setPending(false);
    if (res?.error) return showToast(res.error, "error");
    showToast(editing ? "Category updated." : "Category created.");
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(0);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="wp-panel self-start">
        <div className="wp-panel-header">
          {editing ? `Edit "${editing.name}"` : "Add Category"}
        </div>
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
          <div>
            <label className="wp-label">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="wp-input"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={pending}
              className="wp-btn wp-btn-primary flex-1"
            >
              {pending ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setSlug("");
                  setDescription("");
                  setSortOrder(0);
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
        <div className="wp-panel-header">All Categories</div>
        <div className="overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td className="font-mono text-xs text-[#646970]">/{c.slug}</td>
                  <td className="max-w-[220px] truncate text-sm text-[#646970]">
                    {c.description || "—"}
                  </td>
                  <td>{c.sort_order}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditing(c);
                        setName(c.name);
                        setSlug(c.slug);
                        setDescription(c.description ?? "");
                        setSortOrder(c.sort_order ?? 0);
                      }}
                      className="wp-btn-link"
                    >
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete category "${c.name}"?`)) return;
                        const res = await deleteBlogCategory(c.id);
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
                  <td colSpan={5} className="text-center text-sm text-[#646970]">
                    No categories yet.
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