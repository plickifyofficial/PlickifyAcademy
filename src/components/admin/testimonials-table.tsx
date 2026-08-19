"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/lib/types";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonial,
  moveTestimonial,
} from "@/lib/actions/content-modules";
import { useToast } from "@/components/ui/toaster";

const COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-fuchsia-600",
  "bg-slate-700",
  "bg-indigo-600",
  "bg-orange-500",
];

const emptyForm = {
  name: "",
  role: "",
  course: "",
  quote: "",
  rating: "5",
  initials: "",
  color: "bg-blue-600",
  avatar: "",
  is_published: true,
  is_featured: false,
};

type FormState = typeof emptyForm;

function RatingStars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={`fa-star text-xs ${i < value ? "fa-solid" : "fa-regular"}`} />
      ))}
    </span>
  );
}

export function TestimonialsTable({ items }: { items: Testimonial[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) =>
      `${t.name} ${t.role ?? ""} ${t.course ?? ""} ${t.quote}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  function startCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(t: Testimonial) {
    setForm({
      name: t.name,
      role: t.role ?? "",
      course: t.course ?? "",
      quote: t.quote,
      rating: String(t.rating),
      initials: t.initials ?? "",
      color: t.color ?? "bg-blue-600",
      avatar: t.avatar ?? "",
      is_published: t.is_published,
      is_featured: t.is_featured,
    });
    setEditing(t);
    setCreating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", form.name);
    fd.set("role", form.role);
    fd.set("course", form.course);
    fd.set("quote", form.quote);
    fd.set("rating", form.rating);
    fd.set("initials", form.initials);
    fd.set("color", form.color);
    fd.set("avatar", form.avatar);
    fd.set("is_published", form.is_published ? "on" : "off");
    fd.set("is_featured", form.is_featured ? "on" : "off");
    const res = editing ? await updateTestimonial(fd) : await createTestimonial(fd);
    setPending(false);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(editing ? "Testimonial updated." : "Testimonial created.");
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, role, quote..."
          className="wp-input !w-72"
        />
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add Testimonial
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No testimonials found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Rating</th>
                <th>Quote</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {t.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${t.color ?? "bg-blue-600"}`}>
                          {t.initials || t.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-[#1d2327]">{t.name}</p>
                        <p className="text-xs text-[#646970]">{t.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[#3c434a]">{t.course || "—"}</td>
                  <td>
                    <RatingStars value={t.rating} />
                  </td>
                  <td className="max-w-[260px] truncate text-[#646970]">
                    {t.quote}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        run(() => toggleTestimonial(t.id, "is_featured"), "Updated.")
                      }
                      className={`inline-flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${t.is_featured ? "bg-[#2271b1]" : "bg-[#dcdcde]"}`}
                      aria-label="Toggle featured"
                    >
                      <span className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform ${t.is_featured ? "translate-x-4" : ""}`} />
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        run(() => toggleTestimonial(t.id, "is_published"), "Updated.")
                      }
                      className={`wp-tag border-0 ${t.is_published ? "wp-tag-green" : "wp-tag-gray"}`}
                    >
                      {t.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => run(() => moveTestimonial(t.id, "up"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move up"
                      >
                        <i className="fa-solid fa-chevron-up text-xs" />
                      </button>
                      <button
                        onClick={() => run(() => moveTestimonial(t.id, "down"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move down"
                      >
                        <i className="fa-solid fa-chevron-down text-xs" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => startEdit(t)}
                      className="wp-btn-link"
                    >
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete testimonial "${t.name}"?`))
                          run(() => deleteTestimonial(t.id), "Deleted.");
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
              {editing ? "Edit Testimonial" : "Add Testimonial"}
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
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="wp-input"
                  required
                />
              </div>
              <div>
                <label className="wp-label">Role</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="wp-input"
                  placeholder="Freelancer"
                />
              </div>
              <div>
                <label className="wp-label">Course / Product</label>
                <input
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="wp-input"
                  placeholder="AI Income Mastery"
                />
              </div>
              <div>
                <label className="wp-label">Initials</label>
                <input
                  value={form.initials}
                  onChange={(e) => setForm({ ...form, initials: e.target.value })}
                  className="wp-input"
                  placeholder="RH"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Quote *</label>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  className="wp-input min-h-[90px]"
                  required
                />
              </div>
              <div>
                <label className="wp-label">Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="wp-input"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wp-label">Avatar Color</label>
                <div className="flex flex-wrap gap-1 pt-1">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`h-7 w-7 rounded-full ${c} ${form.color === c ? "ring-2 ring-[#2271b1] ring-offset-1" : ""}`}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Avatar Image URL (optional)</label>
                <input
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  className="wp-input"
                  placeholder="https://..."
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
              <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="wp-checkbox"
                />
                Featured
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
