"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductPublish,
} from "@/lib/actions/products";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/toaster";

const iconOptions = [
  { value: "fa-solid fa-bolt", label: "Bolt" },
  { value: "fa-solid fa-palette", label: "Palette" },
  { value: "fa-solid fa-toolbox", label: "Toolbox" },
  { value: "fa-solid fa-book", label: "Book" },
  { value: "fa-solid fa-file-lines", label: "Document" },
  { value: "fa-solid fa-file-pdf", label: "PDF" },
  { value: "fa-solid fa-video", label: "Video" },
  { value: "fa-solid fa-music", label: "Audio" },
  { value: "fa-solid fa-puzzle-piece", label: "Puzzle" },
  { value: "fa-solid fa-rocket", label: "Rocket" },
  { value: "fa-solid fa-wand-magic-sparkles", label: "Wand" },
  { value: "fa-solid fa-brain", label: "Brain" },
  { value: "fa-solid fa-chart-line", label: "Chart" },
  { value: "fa-solid fa-globe", label: "Globe" },
  { value: "fa-solid fa-cube", label: "Cube" },
];

const gradientOptions = [
  { value: "from-blue-600 to-indigo-600", label: "Blue" },
  { value: "from-violet-600 to-fuchsia-600", label: "Violet" },
  { value: "from-cyan-600 to-blue-700", label: "Cyan" },
  { value: "from-emerald-600 to-teal-600", label: "Emerald" },
  { value: "from-amber-500 to-orange-600", label: "Amber" },
  { value: "from-rose-500 to-pink-600", label: "Rose" },
  { value: "from-slate-600 to-slate-800", label: "Slate" },
  { value: "from-fuchsia-600 to-purple-700", label: "Fuchsia" },
  { value: "from-lime-500 to-green-600", label: "Lime" },
];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  old_price: "0",
  tag: "",
  icon: "fa-solid fa-file-lines",
  gradient: "from-blue-600 to-indigo-600",
  cover_image: "",
  file_url: "",
  is_published: true,
};

type FormState = typeof emptyForm;

function fieldset(
  name: string,
  label: string,
  state: FormState,
  setState: (s: FormState) => void,
  options: { value: string; label: string }[],
) {
  return (
    <div>
      <label className="wp-label">{label}</label>
      <select
        value={state[name as keyof FormState] as string}
        onChange={(e) => setState({ ...state, [name]: e.target.value })}
        className="wp-input"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ProductsTable({ products }: { products: Product[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);

  function startCreate() {
    setForm(emptyForm);
    setCreating(true);
    setEditing(null);
  }

  function startEdit(p: Product) {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      price: String(p.price),
      old_price: String(p.old_price),
      tag: p.tag ?? "",
      icon: p.icon ?? "fa-solid fa-file-lines",
      gradient: p.gradient ?? "from-blue-600 to-indigo-600",
      cover_image: p.cover_image ?? "",
      file_url: p.file_url ?? "",
      is_published: p.is_published,
    });
    setEditing(p);
    setCreating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("slug", form.slug);
    fd.set("description", form.description);
    fd.set("price", form.price);
    fd.set("old_price", form.old_price);
    fd.set("tag", form.tag);
    fd.set("icon", form.icon);
    fd.set("gradient", form.gradient);
    fd.set("cover_image", form.cover_image);
    fd.set("file_url", form.file_url);
    fd.set("is_published", form.is_published ? "on" : "");
    const result = editing
      ? await updateProduct(editing.id, fd)
      : await createProduct(fd);
    setPending(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(editing ? "Product updated" : "Product created");
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const result = await deleteProduct(p.id);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast("Product deleted");
    router.refresh();
  }

  async function handleToggle(p: Product) {
    const result = await toggleProductPublish(p.id, !p.is_published);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    router.refresh();
  }

  const modalOpen = creating || editing;

  return (
    <div>
      <div className="mb-4">
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="wp-panel">
          <div className="wp-panel-body text-sm text-[#646970]">
            No products yet. Click “Add Product” to create your first digital
            product.
          </div>
        </div>
      ) : (
        <div className="wp-panel">
          <div className="overflow-x-auto">
            <table className="wp-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Tag</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${
                            p.gradient || "from-blue-600 to-indigo-600"
                          }`}
                        >
                          <i
                            className={`${
                              p.icon || "fa-solid fa-file-lines"
                            } text-white`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1d2327]">
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-[#646970]">
                            /products/{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-[#3c434a]">
                        {formatPrice(p.price)}
                      </span>
                      {p.old_price > 0 && (
                        <span className="ml-1 text-xs text-[#646970] line-through">
                          {formatPrice(p.old_price)}
                        </span>
                      )}
                    </td>
                    <td>
                      {p.tag && (
                        <span className="wp-tag wp-tag-amber">{p.tag}</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(p)}
                        className={`wp-tag ${
                          p.is_published ? "wp-tag-green" : "wp-tag-red"
                        }`}
                        title="Click to toggle"
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(p)}
                          className="wp-icon-btn"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="wp-icon-btn wp-icon-btn-danger"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
          <div className="fixed inset-x-0 top-4 z-50 mx-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1d2327]">
                {editing ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className="wp-icon-btn"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="wp-label">Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="wp-input"
                  placeholder="e.g. AI Prompt Pack"
                />
              </div>
              <div>
                <label className="wp-label">Slug (optional)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="wp-input"
                  placeholder="auto-generated from name"
                />
              </div>
              <div>
                <label className="wp-label">Tag</label>
                <input
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="wp-input"
                  placeholder="e.g. PROMPTS"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="wp-input"
                  rows={2}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="wp-label">Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Old Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.old_price}
                  onChange={(e) =>
                    setForm({ ...form, old_price: e.target.value })
                  }
                  className="wp-input"
                />
              </div>
              {fieldset("icon", "Icon", form, setForm, iconOptions)}
              {fieldset("gradient", "Color", form, setForm, gradientOptions)}
              <div className="sm:col-span-2">
                <label className="wp-label">Cover Image URL</label>
                <input
                  value={form.cover_image}
                  onChange={(e) =>
                    setForm({ ...form, cover_image: e.target.value })
                  }
                  className="wp-input"
                  placeholder="https://... or Media Library URL"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Download File URL</label>
                <input
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  className="wp-input"
                  placeholder="https://... (uploaded file link)"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                Published
              </label>
              <div className="flex items-end justify-end gap-2">
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
                <button
                  type="submit"
                  disabled={pending}
                  className="wp-btn wp-btn-primary"
                >
                  {pending
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}