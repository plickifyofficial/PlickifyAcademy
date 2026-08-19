"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Instructor } from "@/lib/types";
import {
  createInstructor,
  updateInstructor,
  deleteInstructor,
  toggleInstructor,
  moveInstructor,
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
  slug: "",
  role: "",
  bio: "",
  photo: "",
  initials: "",
  color: "bg-blue-600",
  expertise: "",
  facebook: "",
  youtube: "",
  linkedin: "",
  instagram: "",
  is_featured: false,
  is_published: true,
};

type FormState = typeof emptyForm;

export function InstructorsTable({ items }: { items: Instructor[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.name} ${i.role} ${i.bio} ${(i.expertise ?? []).join(" ")}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  function startCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(i: Instructor) {
    setForm({
      name: i.name,
      slug: i.slug,
      role: i.role,
      bio: i.bio,
      photo: i.photo ?? "",
      initials: i.initials,
      color: i.color ?? "bg-blue-600",
      expertise: (i.expertise ?? []).join(", "),
      facebook: i.facebook ?? "",
      youtube: i.youtube ?? "",
      linkedin: i.linkedin ?? "",
      instagram: i.instagram ?? "",
      is_featured: i.is_featured,
      is_published: i.is_published,
    });
    setEditing(i);
    setCreating(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", form.name);
    fd.set("slug", form.slug);
    fd.set("role", form.role);
    fd.set("bio", form.bio);
    fd.set("photo", form.photo);
    fd.set("initials", form.initials);
    fd.set("color", form.color);
    fd.set("expertise", form.expertise);
    fd.set("facebook", form.facebook);
    fd.set("youtube", form.youtube);
    fd.set("linkedin", form.linkedin);
    fd.set("instagram", form.instagram);
    fd.set("is_featured", form.is_featured ? "on" : "off");
    fd.set("is_published", form.is_published ? "on" : "off");
    const res = editing ? await updateInstructor(fd) : await createInstructor(fd);
    setPending(false);
    if (res.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(editing ? "Instructor updated." : "Instructor created.");
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
          placeholder="Search instructors..."
          className="wp-input !w-72"
        />
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add Instructor
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No instructors found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Role</th>
                <th>Expertise</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {i.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={i.photo}
                          alt={i.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${i.color ?? "bg-blue-600"}`}>
                          {i.initials || i.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-[#1d2327]">{i.name}</p>
                        <p className="text-xs text-[#646970]">/{i.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[#3c434a]">{i.role || "—"}</td>
                  <td className="max-w-[260px]">
                    <div className="flex flex-wrap gap-1">
                      {(i.expertise ?? []).slice(0, 3).map((e) => (
                        <span key={e} className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs text-[#2271b1]">
                          {e}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => run(() => toggleInstructor(i.id, "is_featured"), "Updated.")}
                      className={`inline-flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${i.is_featured ? "bg-[#2271b1]" : "bg-[#dcdcde]"}`}
                      aria-label="Toggle featured"
                    >
                      <span className={`h-5 w-5 transform rounded-full bg-white shadow transition-transform ${i.is_featured ? "translate-x-4" : ""}`} />
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => run(() => toggleInstructor(i.id, "is_published"), "Updated.")}
                      className={`wp-tag border-0 ${i.is_published ? "wp-tag-green" : "wp-tag-gray"}`}
                    >
                      {i.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => run(() => moveInstructor(i.id, "up"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move up"
                      >
                        <i className="fa-solid fa-chevron-up text-xs" />
                      </button>
                      <button
                        onClick={() => run(() => moveInstructor(i.id, "down"), "Moved.")}
                        className="rounded p-1 text-[#646970] hover:bg-[#f0f0f1] hover:text-[#2271b1]"
                        aria-label="Move down"
                      >
                        <i className="fa-solid fa-chevron-down text-xs" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => startEdit(i)} className="wp-btn-link">
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete instructor "${i.name}"?`))
                          run(() => deleteInstructor(i.id), "Deleted.");
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
          <div className="wp-panel w-full max-w-2xl">
            <div className="wp-panel-header">
              {editing ? "Edit Instructor" : "Add Instructor"}
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
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editing ? form.slug : e.target.value,
                    })
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
                <label className="wp-label">Role / Title</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="wp-input"
                  placeholder="Founder & Lead Instructor"
                />
              </div>
              <div>
                <label className="wp-label">Initials</label>
                <input
                  value={form.initials}
                  onChange={(e) => setForm({ ...form, initials: e.target.value })}
                  className="wp-input"
                  placeholder="MI"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="wp-label">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="wp-input min-h-[90px]"
                />
              </div>
              <div>
                <label className="wp-label">Photo URL (optional)</label>
                <input
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  className="wp-input"
                  placeholder="https://..."
                />
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
                <label className="wp-label">Expertise (comma separated)</label>
                <input
                  value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  className="wp-input"
                  placeholder="AI, Graphic Design, Freelancing"
                />
              </div>
              <div>
                <label className="wp-label">Facebook</label>
                <input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  className="wp-input"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="wp-label">YouTube</label>
                <input
                  value={form.youtube}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  className="wp-input"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="wp-label">LinkedIn</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  className="wp-input"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="wp-label">Instagram</label>
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="wp-input"
                  placeholder="https://instagram.com/..."
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