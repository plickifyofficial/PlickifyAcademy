"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/types";
import {
  createPost,
  updatePost,
  deletePost,
  togglePost,
} from "@/lib/actions/blog";
import { uploadContentImage } from "@/lib/actions/content";
import { useToast } from "@/components/ui/toaster";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  tags: string;
  reading_time: string;
  is_featured: boolean;
  is_published: boolean;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_image: "",
  author_name: "",
  author_role: "",
  tags: "",
  reading_time: "5 min read",
  is_featured: false,
  is_published: true,
};

function clientSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PostsTable({ items }: { items: BlogPost[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        `${p.title} ${p.excerpt ?? ""} ${(p.tags ?? []).join(" ")}`
          .toLowerCase()
          .includes(q),
    );
  }, [items, search]);

  function startCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  }

  function startEdit(p: BlogPost) {
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      body: p.body ?? "",
      cover_image: p.cover_image ?? "",
      author_name: p.author_name ?? "",
      author_role: p.author_role ?? "",
      tags: (p.tags ?? []).join(", "),
      reading_time: p.reading_time ?? "",
      is_featured: p.is_featured,
      is_published: p.is_published,
    });
    setEditing(p);
    setCreating(false);
  }

  function slugForTitle(title: string) {
    if (form.slug.trim() || editing) return;
    setForm((f) => ({ ...f, slug: clientSlug(title) }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (editing) fd.set("id", editing.id);
    fd.set("title", form.title);
    fd.set("slug", form.slug);
    fd.set("excerpt", form.excerpt);
    fd.set("body", form.body);
    fd.set("cover_image", form.cover_image);
    fd.set("author_name", form.author_name);
    fd.set("author_role", form.author_role);
    fd.set("tags", form.tags);
    fd.set("reading_time", form.reading_time);
    fd.set("is_featured", form.is_featured ? "on" : "off");
    fd.set("is_published", form.is_published ? "on" : "off");
    const res = editing ? await updatePost(fd) : await createPost(fd);
    setPending(false);
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(editing ? "Post updated." : "Post created.");
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadContentImage(fd);
      setForm((f) => ({ ...f, cover_image: res.url }));
      showToast("Cover uploaded");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function run(
    fn: () => Promise<{ success?: boolean; error?: string } | undefined>,
    msg: string,
  ) {
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
          placeholder="Search posts..."
          className="wp-input !w-72"
        />
        <button onClick={startCreate} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> Add Post
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <p className="p-6 text-sm text-[#646970]">No posts found.</p>
        </div>
      ) : (
        <div className="wp-panel overflow-x-auto">
          <table className="wp-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Tags</th>
                <th>Views</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <p className="font-medium text-[#1d2327]">{p.title}</p>
                    <p className="max-w-[320px] truncate text-xs text-[#646970]">
                      /blog/{p.slug}
                    </p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(p.tags ?? []).slice(0, 2).map((t) => (
                        <span key={t} className="wp-tag wp-tag-gray">
                          {t}
                        </span>
                      ))}
                      {(p.tags ?? []).length > 2 && (
                        <span className="wp-tag wp-tag-gray">
                          +{(p.tags ?? []).length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-[#646970]">{p.view_count ?? 0}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => run(() => togglePost(p.id, "is_published"), "Updated.")}
                      className={`wp-tag border-0 ${p.is_published ? "wp-tag-green" : "wp-tag-gray"}`}
                    >
                      {p.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => run(() => togglePost(p.id, "is_featured"), "Updated.")}
                      className={`wp-tag border-0 ${p.is_featured ? "wp-tag-blue" : "wp-tag-gray"}`}
                    >
                      {p.is_featured ? "Featured" : "Normal"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => startEdit(p)} className="wp-btn-link">
                      <i className="fa-solid fa-pen" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this post?"))
                          run(() => deletePost(p.id), "Deleted.");
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
              {editing ? "Edit Post" : "Add Post"}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="wp-label">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      slugForTitle(e.target.value);
                    }}
                    className="wp-input"
                    required
                  />
                </div>
                <div>
                  <label className="wp-label">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated from title"
                    className="wp-input"
                  />
                </div>
              </div>
              <div>
                <label className="wp-label">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="wp-input min-h-[60px]"
                />
              </div>
              <div>
                <label className="wp-label">Body (Markdown supported)</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="wp-input min-h-[200px] font-mono text-xs"
                  placeholder="# Heading

Some **bold** text, - bullet lists, 1. numbered lists, [links](https://...)"
                />
              </div>
              <div>
                <label className="wp-label">Cover Image</label>
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
                    {form.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.cover_image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <i className="fa-solid fa-image text-[#8c8f94]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={form.cover_image}
                      onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                      placeholder="Image URL or upload"
                      className="wp-input"
                    />
                    <label className="block w-fit cursor-pointer rounded border border-dashed border-[#8c8f94] px-3 py-2 text-center text-xs font-medium text-[#2271b1] hover:border-[#2271b1]">
                      <i className="fa-solid fa-upload mr-1" />
                      {uploading ? "Uploading..." : "Upload Cover"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="wp-label">Author Name</label>
                  <input
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    className="wp-input"
                  />
                </div>
                <div>
                  <label className="wp-label">Author Role</label>
                  <input
                    value={form.author_role}
                    onChange={(e) => setForm({ ...form, author_role: e.target.value })}
                    className="wp-input"
                  />
                </div>
                <div>
                  <label className="wp-label">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="wp-input"
                  />
                </div>
                <div>
                  <label className="wp-label">Reading Time</label>
                  <input
                    value={form.reading_time}
                    onChange={(e) => setForm({ ...form, reading_time: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="wp-input"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-5">
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
              </div>
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