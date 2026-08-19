"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductPublish,
  uploadProductImage,
  uploadProductFile,
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

const categoryOptions = [
  { value: "", label: "None" },
  { value: "AI Tools", label: "AI Tools" },
  { value: "Prompt Packs", label: "Prompt Packs" },
  { value: "Canva Templates", label: "Canva Templates" },
  { value: "eBooks", label: "eBooks" },
  { value: "Freelancing", label: "Freelancing" },
  { value: "Graphic Design", label: "Graphic Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Productivity", label: "Productivity" },
  { value: "Content Creation", label: "Content Creation" },
  { value: "Design Resources", label: "Design Resources" },
];

const typeOptions = [
  { value: "", label: "None" },
  { value: "Template", label: "Template" },
  { value: "eBook", label: "eBook" },
  { value: "Prompt Pack", label: "Prompt Pack" },
  { value: "Toolkit", label: "Toolkit" },
  { value: "Course Resource", label: "Course Resource" },
  { value: "Design Asset", label: "Design Asset" },
];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  old_price: "0",
  tag: "",
  category: "",
  product_type: "",
  tags: "",
  icon: "fa-solid fa-file-lines",
  gradient: "from-blue-600 to-indigo-600",
  cover_image: "",
  file_url: "",
  file_format: "",
  file_size: "",
  file_count: "0",
  rating_avg: "0",
  review_count: "0",
  download_count: "0",
  is_featured: false,
  is_bestseller: false,
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
  const [uploading, setUploading] = useState(false);

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
      category: p.category ?? "",
      product_type: p.product_type ?? "",
      tags: (p.tags ?? []).join(", "),
      icon: p.icon ?? "fa-solid fa-file-lines",
      gradient: p.gradient ?? "from-blue-600 to-indigo-600",
      cover_image: p.cover_image ?? "",
      file_url: p.file_url ?? "",
      file_format: p.file_format ?? "",
      file_size: p.file_size ?? "",
      file_count: String(p.file_count ?? 0),
      rating_avg: String(p.rating_avg ?? 0),
      review_count: String(p.review_count ?? 0),
      download_count: String(p.download_count ?? 0),
      is_featured: p.is_featured,
      is_bestseller: p.is_bestseller,
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
    fd.set("category", form.category);
    fd.set("product_type", form.product_type);
    fd.set("tags", form.tags);
    fd.set("icon", form.icon);
    fd.set("gradient", form.gradient);
    fd.set("cover_image", form.cover_image);
    fd.set("file_url", form.file_url);
    fd.set("file_format", form.file_format);
    fd.set("file_size", form.file_size);
    fd.set("file_count", form.file_count);
    fd.set("rating_avg", form.rating_avg);
    fd.set("review_count", form.review_count);
    fd.set("download_count", form.download_count);
    fd.set("is_featured", form.is_featured ? "on" : "");
    fd.set("is_bestseller", form.is_bestseller ? "on" : "");
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadProductImage(fd);
    setUploading(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    if (result?.url) setForm({ ...form, cover_image: result.url });
    showToast("Image uploaded");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadProductFile(fd);
    setUploading(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    if (result?.path) {
      setForm({
        ...form,
        file_url: result.path,
        file_format: result.format ?? form.file_format,
        file_size: result.size ?? form.file_size,
      });
    }
    showToast("File uploaded to secure storage");
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
              <div>
                <label className="wp-label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="wp-input"
                >
                  {categoryOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wp-label">Product Type</label>
                <select
                  value={form.product_type}
                  onChange={(e) =>
                    setForm({ ...form, product_type: e.target.value })
                  }
                  className="wp-input"
                >
                  {typeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wp-label">Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="wp-input"
                  placeholder="ai, prompts, chatgpt"
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
                <label className="wp-label">Cover Image</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="wp-input flex cursor-pointer items-center gap-2 !w-auto !py-2">
                    <i className="fa-solid fa-upload text-[#2271b1]" />
                    <span className="text-sm font-medium text-[#2271b1]">
                      {uploading ? "Uploading..." : "Upload Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={uploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                  {form.cover_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.cover_image}
                      alt="Product preview"
                      className="h-14 w-24 rounded object-cover"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <label className="wp-label">Or Image URL</label>
                  <input
                    value={form.cover_image}
                    onChange={(e) =>
                      setForm({ ...form, cover_image: e.target.value })
                    }
                    className="wp-input"
                    placeholder="https://... (uploaded file link)"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Download File</label>
                <div className="flex gap-2">
                  <input
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                    className="wp-input flex-1"
                    placeholder="Upload a file OR paste https:// URL"
                  />
                  <label
                    className="wp-btn cursor-pointer whitespace-nowrap"
                    style={{ margin: 0 }}
                  >
                    <i className="fa-solid fa-upload" />{" "}
                    {uploading ? "..." : "Upload"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-[#646970]">
                  Files upload to secure private storage — buyers download through
                  the protected download link only.
                </p>
              </div>
              <div>
                <label className="wp-label">File Format</label>
                <input
                  value={form.file_format}
                  onChange={(e) =>
                    setForm({ ...form, file_format: e.target.value })
                  }
                  className="wp-input"
                  placeholder="PDF + TXT"
                />
              </div>
              <div>
                <label className="wp-label">File Size</label>
                <input
                  value={form.file_size}
                  onChange={(e) =>
                    setForm({ ...form, file_size: e.target.value })
                  }
                  className="wp-input"
                  placeholder="2 MB"
                />
              </div>
              <div>
                <label className="wp-label">File Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.file_count}
                  onChange={(e) =>
                    setForm({ ...form, file_count: e.target.value })
                  }
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating_avg}
                  onChange={(e) =>
                    setForm({ ...form, rating_avg: e.target.value })
                  }
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Review Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.review_count}
                  onChange={(e) =>
                    setForm({ ...form, review_count: e.target.value })
                  }
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Download Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.download_count}
                  onChange={(e) =>
                    setForm({ ...form, download_count: e.target.value })
                  }
                  className="wp-input"
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm({ ...form, is_featured: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                  <input
                    type="checkbox"
                    checked={form.is_bestseller}
                    onChange={(e) =>
                      setForm({ ...form, is_bestseller: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Bestseller
                </label>
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
              </div>
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