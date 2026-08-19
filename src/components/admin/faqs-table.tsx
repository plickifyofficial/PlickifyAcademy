"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Faq } from "@/lib/types";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaq,
  moveFaq,
} from "@/lib/actions/content-modules";
import { useToast } from "@/components/ui/toaster";

const PAGE_OPTIONS: { value: Faq["page"]; label: string }[] = [
  { value: "homepage", label: "Homepage" },
  { value: "courses", label: "Courses" },
  { value: "products", label: "Digital Products" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "global", label: "Global" },
];

const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  PAGE_OPTIONS.map((p) => [p.value, p.label]),
);

const emptyForm = {
  question: "",
  answer: "",
  page: "homepage" as Faq["page"],
  is_published: true,
};

type FormState = typeof emptyForm;

export function FaqsTable({ items }: { items: Faq[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("All");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((f) => {
      if (page !== "All" && f.page !== page) return false;
      if (q && !`${f.question} ${f.answer}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, page]);

  function startCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(f: Faq) {
    setForm({
      question: f.question,
      answer: f.answer,
      page: f.page,
      is_published: f.is_published,
    });
    setEditing(f);
    setCreating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("question", form.question);
    fd.set("answer", form.answer);
    fd.set("page", form.page);
    fd.set("is_published", form.is_published ? "on" : "off");
    const res = editing ? await updateFaq(fd) : await createFaq(fd);
    setPending(false);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(editing ? "FAQ updated." : "FAQ created.");
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="wp-input !w-72"
          />
          <select value={page} onChange={(e) => setPage(e.target.value)} className="wp-input !w-auto">
            <option value="All">All Pages</option>
            {PAGE_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add FAQ
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No FAQs found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Page</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <p className="font-medium text-[#1d2327]">{f.question}</p>
                    <p className="max-w-[380px] truncate text-xs text-[#646970]">{f.answer}</p>
                  </td>
                  <td>
                    <span className="wp-tag wp-tag-gray">{PAGE_LABELS[f.page]}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => run(() => toggleFaq(f.id), "Updated.")}
                      className={`wp-tag border-0 ${f.is_published ? "wp-tag-green" : "wp-tag-gray"}`}
                    >
                      {f.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => run(() => moveFaq(f.id, "up"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move up"
                      >
                        <i className="fa-solid fa-chevron-up text-xs" />
                      </button>
                      <button
                        onClick={() => run(() => moveFaq(f.id, "down"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move down"
                      >
                        <i className="fa-solid fa-chevron-down text-xs" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => startEdit(f)} className="wp-btn-link">
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this FAQ?"))
                          run(() => deleteFaq(f.id), "Deleted.");
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
              {editing ? "Edit FAQ" : "Add FAQ"}
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
            <form onSubmit={handleSubmit} className="wp-panel-body grid grid-cols-1 gap-3">
              <div>
                <label className="wp-label">Question *</label>
                <input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="wp-input"
                  required
                />
              </div>
              <div>
                <label className="wp-label">Answer *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="wp-input min-h-[110px]"
                  required
                />
              </div>
              <div>
                <label className="wp-label">Page</label>
                <select
                  value={form.page}
                  onChange={(e) => setForm({ ...form, page: e.target.value as Faq["page"] })}
                  className="wp-input"
                >
                  {PAGE_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
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
              <div className="flex gap-2">
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
