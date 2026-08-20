"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogAuthor } from "@/lib/types";
import {
  createBlogAuthor,
  deleteBlogAuthor,
  updateBlogAuthor,
} from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";
import { clientSlug } from "@/lib/blog-utils";

const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook", icon: "fa-brands fa-facebook" },
  { key: "youtube", label: "YouTube", icon: "fa-brands fa-youtube" },
  { key: "linkedin", label: "LinkedIn", icon: "fa-brands fa-linkedin" },
  { key: "instagram", label: "Instagram", icon: "fa-brands fa-instagram" },
  { key: "x", label: "X (Twitter)", icon: "fa-brands fa-x-twitter" },
] as const;

export function AuthorsManager({ items }: { items: BlogAuthor[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState<BlogAuthor | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    photo: "",
    role: "",
    bio: "",
    expertise: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    instagram: "",
    x: "",
  });

  function reset() {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      photo: "",
      role: "",
      bio: "",
      expertise: "",
      facebook: "",
      youtube: "",
      linkedin: "",
      instagram: "",
      x: "",
    });
  }

  function startEdit(a: BlogAuthor) {
    setEditing(a);
    setForm({
      name: a.name,
      slug: a.slug,
      photo: a.photo ?? "",
      role: a.role ?? "",
      bio: a.bio ?? "",
      expertise: (a.expertise ?? []).join(", "),
      facebook: a.socials?.facebook ?? "",
      youtube: a.socials?.youtube ?? "",
      linkedin: a.socials?.linkedin ?? "",
      instagram: a.socials?.instagram ?? "",
      x: a.socials?.x ?? "",
    });
  }

  async function save() {
    if (!form.name.trim()) return showToast("Name is required.", "error");
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("name", form.name);
    fd.set("slug", form.slug || clientSlug(form.name));
    fd.set("photo", form.photo);
    fd.set("role", form.role);
    fd.set("bio", form.bio);
    fd.set("expertise", form.expertise);
    for (const s of SOCIAL_FIELDS) fd.set(s.key, form[s.key]);
    const res = editing ? await updateBlogAuthor(fd) : await createBlogAuthor(fd);
    setPending(false);
    if (res?.error) return showToast(res.error, "error");
    showToast(editing ? "Author updated." : "Author created.");
    reset();
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="wp-panel self-start">
        <div className="wp-panel-header">
          {editing ? `Edit "${editing.name}"` : "Add Author"}
        </div>
        <div className="wp-panel-body grid grid-cols-1 gap-3">
          <div>
            <label className="wp-label">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto from name"
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Course Instructor"
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Photo URL</label>
            <input
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="wp-input min-h-[60px]"
            />
          </div>
          <div>
            <label className="wp-label">Expertise (comma separated)</label>
            <input
              value={form.expertise}
              onChange={(e) => setForm({ ...form, expertise: e.target.value })}
              className="wp-input"
            />
          </div>
          {SOCIAL_FIELDS.map((s) => (
            <div key={s.key}>
              <label className="wp-label">
                <i className={`${s.icon} mr-1`} /> {s.label}
              </label>
              <input
                value={form[s.key]}
                onChange={(e) => setForm({ ...form, [s.key]: e.target.value })}
                className="wp-input"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={save} disabled={pending} className="wp-btn wp-btn-primary flex-1">
              {pending ? "Saving..." : editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button onClick={reset} className="wp-btn">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="wp-panel lg:col-span-2">
        <div className="wp-panel-header">All Authors</div>
        <div className="overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Role</th>
                <th>Posts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700">
                        {a.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.photo} alt={a.name} className="h-full w-full object-cover" />
                        ) : (
                          a.name.slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="font-mono text-xs text-[#646970]">/{a.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-[#646970]">{a.role || "—"}</td>
                  <td className="text-sm text-[#646970]">
                    {(a as unknown as { posts?: unknown[] }).posts?.length ?? "—"}
                  </td>
                  <td>
                    <button onClick={() => startEdit(a)} className="wp-btn-link">
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete author "${a.name}"?`)) return;
                        const res = await deleteBlogAuthor(a.id);
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
                    No authors yet.
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