"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  moveCategory,
} from "@/lib/actions/content-modules";
import { useToast } from "@/components/ui/toaster";

const ICONS = [
  "fa-solid fa-tag",
  "fa-solid fa-robot",
  "fa-solid fa-briefcase",
  "fa-solid fa-palette",
  "fa-solid fa-bullhorn",
  "fa-solid fa-wand-magic-sparkles",
  "fa-solid fa-globe",
  "fa-solid fa-brain",
  "fa-solid fa-bolt",
  "fa-solid fa-book",
  "fa-solid fa-file-lines",
  "fa-solid fa-cube",
  "fa-solid fa-chart-line",
  "fa-solid fa-puzzle-piece",
];

const emptyForm = {
  name: "",
  slug: "",
  icon: "fa-solid fa-tag",
  description: "",
  image: "",
  is_published: true,
};

type FormState = typeof emptyForm;

export function CategoriesTable({ items }: { items: Category[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [type, setType] = useState<"course" | "product">("course");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((c) => c.type === type)
      .filter((c) => !q || `${c.name} ${c.slug} ${c.description ?? ""}`.toLowerCase().includes(q));
  }, [items, type, search]);

  function startCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(c: Category) {
    setForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon ?? "fa-solid fa-tag",
      description: c.description ?? "",
      image: c.image ?? "",
      is_published: c.is_published,
    });
    setEditing(c);
    setCreating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", form.name);
    fd.set("slug", form.slug);
    fd.set("type", type);
    fd.set("icon", form.icon);
    fd.set("description", form.description);
    fd.set("image", form.image);
    fd.set("is_published", form.is_published ? "on" : "off");
    const res = editing ? await updateCategory(fd) : await createCategory(fd);
    setPending(false);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(editing ? "Category updated." : "Category created.");
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  async function run(fn: () => Promise<{ success?: boolean; error?: string } | undefined>, msg: string) {
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
          <div className="flex rounded border border-[#c3c4c7] bg-white">
            {(["course", "product"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded px-3 py-1.5 text-sm font-medium capitalize ${
                  type === t ? "bg-[#2271b1] text-white" : "text-[#3c434a] hover:bg-[#f0f0f1]"
                }`}
              >
                {t === "course" ? "Course" : "Product"}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="wp-input !w-64"
          />
        </div>
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add {type === "course" ? "Course" : "Product"} Category
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No categories found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded bg-[#f0f6fc] text-[#2271b1]">
                      <i className={`${c.icon ?? "fa-solid fa-tag"} text-sm`} />
                    </span>
                    <span className="font-semibold text-[#1d2327]">{c.name}</span>
                  </td>
                  <td className="text-[#646970]">/{c.slug}</td>
                  <td className="max-w-[280px] truncate text-[#646970]">{c.description || "—"}</td>
                  <td>
                    <button
                      onClick={() => run(() => toggleCategory(c.id), "Updated.")}
                      className={`wp-tag border-0 ${c.is_published ? "wp-tag-green" : "wp-tag-gray"}`}
                    >
                      {c.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => run(() => moveCategory(c.id, "up"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move up"
                      >
                        <i className="fa-solid fa-chevron-up text-xs" />
                      </button>
                      <button
                        onClick={() => run(() => moveCategory(c.id, "down"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move down"
                      >
                        <i className="fa-solid fa-chevron-down text-xs" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => startEdit(c)} className="wp-btn-link">
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${c.name}"?`))
                          run(() => deleteCategory(c.id), "Deleted.");
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

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
          <div className="wp-panel w-full max-w-xl">
            <div className="wp-panel-header">
              {editing ? "Edit Category" : `Add ${type === "course" ? "Course" : "Product"} Category`}
              <button
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className="text-[#646970] hover:text-[#1d2327]"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="wp-panel-body grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="wp-label">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value })
                  }
                  className="wp-input"
                  required
                />
              </div>
              <div>
                <label className="wp-label">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="wp-input"
                  placeholder="auto-generated"
                />
              </div>
              <div>
                <label className="wp-label">Icon</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="wp-input"
                >
                  {ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i.replace("fa-solid ", "")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wp-label">Image URL (optional)</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="wp-input"
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="wp-input min-h-[70px]"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="wp-checkbox"
                />
                Published
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" disabled={pending} className="wp-btn wp-btn-primary">
                  {pending ? "Saving..." : editing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditing(null);
                  }}
                  className="wp-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
