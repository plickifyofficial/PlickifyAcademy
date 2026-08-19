"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Batch } from "@/lib/types";
import {
  createBatch,
  updateBatch,
  deleteBatch,
  toggleBatch,
  moveBatch,
} from "@/lib/actions/content-modules";
import { useToast } from "@/components/ui/toaster";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed", label: "Closed" },
];

const STATUS_CLASS: Record<string, string> = {
  open: "wp-tag-green",
  upcoming: "wp-tag-blue",
  ongoing: "wp-tag-amber",
  closed: "wp-tag-gray",
};

const emptyForm = {
  course_id: "",
  title: "",
  description: "",
  start_date: "",
  duration: "",
  schedule: "",
  class_count: "0",
  seats_total: "30",
  seats_filled: "0",
  price: "0",
  old_price: "0",
  status: "open",
  is_featured: false,
  is_published: true,
  meeting_info: "",
  features: "",
};

type FormState = typeof emptyForm;

export function BatchesTable({
  items,
  courses,
}: {
  items: Batch[];
  courses: { id: string; title: string }[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      if (status !== "All" && b.status !== status) return false;
      if (q && !`${b.title} ${b.description} ${b.schedule}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [items, search, status]);

  function startCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(b: Batch) {
    setForm({
      course_id: b.course_id ?? "",
      title: b.title,
      description: b.description,
      start_date: b.start_date ?? "",
      duration: b.duration,
      schedule: b.schedule,
      class_count: String(b.class_count),
      seats_total: String(b.seats_total),
      seats_filled: String(b.seats_filled),
      price: String(b.price),
      old_price: String(b.old_price),
      status: b.status,
      is_featured: b.is_featured,
      is_published: b.is_published,
      meeting_info: b.meeting_info,
      features: (b.features ?? []).join(", "),
    });
    setEditing(b);
    setCreating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("course_id", form.course_id);
    fd.set("title", form.title);
    fd.set("description", form.description);
    fd.set("start_date", form.start_date);
    fd.set("duration", form.duration);
    fd.set("schedule", form.schedule);
    fd.set("class_count", form.class_count);
    fd.set("seats_total", form.seats_total);
    fd.set("seats_filled", form.seats_filled);
    fd.set("price", form.price);
    fd.set("old_price", form.old_price);
    fd.set("status", form.status);
    fd.set("is_featured", form.is_featured ? "on" : "off");
    fd.set("is_published", form.is_published ? "on" : "off");
    fd.set("meeting_info", form.meeting_info);
    fd.set("features", form.features);
    const res = editing ? await updateBatch(fd) : await createBatch(fd);
    setPending(false);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(editing ? "Batch updated." : "Batch created.");
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

  const courseTitle = (id: string | null) =>
    courses.find((c) => c.id === id)?.title ?? "—";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches..."
            className="wp-input !w-64"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="wp-input !w-auto"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add Batch
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No batches found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Course</th>
                <th>Starts</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Published</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const pct = Math.min(
                  100,
                  Math.round((b.seats_filled / Math.max(1, b.seats_total)) * 100),
                );
                return (
                  <tr key={b.id}>
                    <td>
                      <p className="font-semibold text-[#1d2327]">{b.title}</p>
                      <p className="max-w-[240px] truncate text-xs text-[#646970]">
                        {b.description || b.schedule}
                      </p>
                    </td>
                    <td className="text-[#3c434a]">{courseTitle(b.course_id)}</td>
                    <td className="text-[#646970]">
                      {b.start_date
                        ? new Date(b.start_date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "TBA"}
                    </td>
                    <td>
                      <div className="w-28">
                        <div className="mb-1 flex justify-between text-xs text-[#646970]">
                          <span>{b.seats_filled}</span>
                          <span>{b.seats_total}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f1]">
                          <div
                            className={`h-full rounded-full ${pct >= 100 ? "bg-[#b32d2e]" : "bg-[#2271b1]"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold text-[#3c434a]">
                      ৳{Number(b.price).toLocaleString("en-IN")}
                      {Number(b.old_price) > Number(b.price) && (
                        <span className="ml-1 text-xs font-normal text-[#646970] line-through">
                          ৳{Number(b.old_price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`wp-tag ${STATUS_CLASS[b.status] ?? "wp-tag-gray"}`}>
                        {STATUS_OPTIONS.find((s) => s.value === b.status)?.label ?? b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => run(() => toggleBatch(b.id, "is_featured"), "Updated.")}
                        className={`inline-flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${b.is_featured ? "bg-[#2271b1]" : "bg-[#dcdcde]"}`}
                        aria-label="Toggle featured"
                      >
                        <span className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform ${b.is_featured ? "translate-x-4" : ""}`} />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => run(() => toggleBatch(b.id, "is_published"), "Updated.")}
                        className={`wp-tag border-0 ${b.is_published ? "wp-tag-green" : "wp-tag-gray"}`}
                      >
                        {b.is_published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => run(() => moveBatch(b.id, "up"), "Moved.")}
                          className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                          aria-label="Move up"
                        >
                          <i className="fa-solid fa-chevron-up text-xs" />
                        </button>
                        <button
                          onClick={() => run(() => moveBatch(b.id, "down"), "Moved.")}
                          className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                          aria-label="Move down"
                        >
                          <i className="fa-solid fa-chevron-down text-xs" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => startEdit(b)} className="wp-btn-link">
                        <i className="fa-solid fa-pen" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete batch "${b.title}"?`))
                            run(() => deleteBatch(b.id), "Deleted.");
                        }}
                        className="wp-btn-link ml-2 text-[#b32d2e] hover:text-[#8a1e1e]"
                      >
                        <i className="fa-solid fa-trash" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
          <div className="wp-panel w-full max-w-2xl">
            <div className="wp-panel-header">
              {editing ? "Edit Batch" : "Add Batch"}
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
              <div className="sm:col-span-2">
                <label className="wp-label">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="wp-input"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Course</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="wp-input"
                >
                  <option value="">No course linked</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="wp-input min-h-[70px]"
                />
              </div>
              <div>
                <label className="wp-label">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Duration</label>
                <input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="wp-input"
                  placeholder="3 Months"
                />
              </div>
              <div>
                <label className="wp-label">Schedule</label>
                <input
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  className="wp-input"
                  placeholder="Weekly 2 Live Classes"
                />
              </div>
              <div>
                <label className="wp-label">Class Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.class_count}
                  onChange={(e) => setForm({ ...form, class_count: e.target.value })}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Seats Total</label>
                <input
                  type="number"
                  min="1"
                  value={form.seats_total}
                  onChange={(e) => setForm({ ...form, seats_total: e.target.value })}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Seats Filled</label>
                <input
                  type="number"
                  min="0"
                  value={form.seats_filled}
                  onChange={(e) => setForm({ ...form, seats_filled: e.target.value })}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Price (৳)</label>
                <input
                  type="number"
                  min="0"
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
                  value={form.old_price}
                  onChange={(e) => setForm({ ...form, old_price: e.target.value })}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="wp-input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="wp-label">Meeting / Enrollment Link</label>
                <input
                  value={form.meeting_info}
                  onChange={(e) => setForm({ ...form, meeting_info: e.target.value })}
                  className="wp-input"
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Features (comma separated)</label>
                <input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="wp-input"
                  placeholder="Weekly 2 Live Classes, Recording, Resource Pack"
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