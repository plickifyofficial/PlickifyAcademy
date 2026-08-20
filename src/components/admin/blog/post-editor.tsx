"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPost,
  BlogTag,
} from "@/lib/types";
import { createPost, updatePost } from "@/lib/actions/blog";
import { uploadContentImage } from "@/lib/actions/content";
import { useToast } from "@/components/ui/toaster";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type CourseOption = { id: string; title: string; slug: string };
type ProductOption = { id: string; name: string; slug: string };

function clientSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PostEditor({
  post,
  categories,
  authors,
  allTags,
  courses,
  products,
}: {
  post?: BlogPost | null;
  categories: BlogCategory[];
  authors: BlogAuthor[];
  allTags: BlogTag[];
  courses: CourseOption[];
  products: ProductOption[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [cover, setCover] = useState(post?.cover_image ?? "");
  const [ogImage, setOgImage] = useState(post?.og_image ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [authorId, setAuthorId] = useState(post?.author_id ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "");
  const [authorRole, setAuthorRole] = useState(post?.author_role ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    post?.status ?? "draft",
  );
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduled_at
      ? post.scheduled_at.slice(0, 16)
      : "",
  );
  const [readingTime, setReadingTime] = useState(post?.reading_time ?? "");
  const [isFeatured, setIsFeatured] = useState(post?.is_featured ?? false);
  const [isPopular, setIsPopular] = useState(post?.is_popular ?? false);
  const [isTrending, setIsTrending] = useState(post?.is_trending ?? false);
  const [isEditorsPick, setIsEditorsPick] = useState(post?.is_editors_pick ?? false);
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url ?? "");
  const [noindex, setNoindex] = useState(post?.noindex ?? false);
  const [relatedCourseId, setRelatedCourseId] = useState(post?.related_course_id ?? "");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    post?.related_product_ids ?? [],
  );

  function buildFormData(
    saveStatus: "draft" | "published" | "scheduled",
    overrides: { body?: string; excerpt?: string } = {},
  ) {
    const fd = new FormData();
    if (post) fd.set("id", post.id);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("excerpt", overrides.excerpt ?? excerpt);
    fd.set("body", overrides.body ?? body);
    fd.set("cover_image", cover);
    fd.set("og_image", ogImage);
    fd.set("category_id", categoryId);
    fd.set("author_id", authorId);
    fd.set("author_name", authorName || "");
    fd.set("author_role", authorRole || "");
    fd.set("tags", tags);
    fd.set("status", saveStatus);
    if (saveStatus === "scheduled" && scheduledAt) {
      fd.set("scheduled_at", new Date(scheduledAt).toISOString());
    }
    fd.set("reading_time", readingTime);
    fd.set("is_featured", isFeatured ? "on" : "off");
    fd.set("is_popular", isPopular ? "on" : "off");
    fd.set("is_trending", isTrending ? "on" : "off");
    fd.set("is_editors_pick", isEditorsPick ? "on" : "off");
    fd.set("seo_title", seoTitle);
    fd.set("meta_description", metaDescription);
    fd.set("canonical_url", canonicalUrl);
    fd.set("noindex", noindex ? "on" : "off");
    fd.set("related_course_id", relatedCourseId);
    fd.set("related_product_ids", relatedProductIds.join(","));
    return fd;
  }

  async function save(saveStatus: "draft" | "published" | "scheduled") {
    setPending(true);
    const fd = buildFormData(saveStatus);
    const res = post ? await updatePost(fd) : await createPost(fd);
    setPending(false);
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    showToast("Post saved.");
    router.push("/admin/blog/posts");
    router.refresh();
  }

  async function autosaveDraft(html: string) {
    if (!post) return;
    setBody(html);
    const fd = buildFormData("draft", { body: html });
    const res = await updatePost(fd);
    if (res?.error) throw new Error(res.error);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadContentImage(fd);
      setCover(res.url);
      showToast("Cover uploaded");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  function toggleProduct(id: string) {
    setRelatedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const field = "wp-input";
  const label = "wp-label";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save(status);
      }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div className="space-y-4 lg:col-span-2">
        <div className="wp-panel">
          <div className="wp-panel-header">Content</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div>
              <label className={label}>Title *</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!post && !slug.trim()) setSlug(clientSlug(e.target.value));
                }}
                className={field}
                required
              />
            </div>
            <div>
              <label className={label}>Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Excerpt</label>
              <RichTextEditor
                value={excerpt}
                onChange={setExcerpt}
                preset="medium"
                placeholder="Short summary shown on cards & in search engines..."
                minHeight={90}
              />
            </div>
            <div>
              <label className={label}>Body</label>
              <RichTextEditor
                value={body}
                onChange={setBody}
                preset="full"
                placeholder={"Start writing your post... Use the toolbar to format text, add images, tables, quotes, code, videos, courses and products."}
                minHeight={380}
                autosave={autosaveDraft}
                courseOptions={courses}
                productOptions={products.map((p) => ({ ...p, title: p.name }))}
              />
              <p className="mt-1 text-xs text-[#646970]">
                <i className="fa-solid fa-circle-info mr-1" />
                Auto-saves a draft while you type. Old markdown posts still render fine.
              </p>
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">Featured Image</div>
          <div className="wp-panel-body flex items-start gap-3">
            <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <i className="fa-solid fa-image text-[#8c8f94]" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Image URL or upload"
                className={field}
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

        <div className="wp-panel">
          <div className="wp-panel-header">SEO</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div>
              <label className={label}>SEO Title</label>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className={`${field} min-h-[50px]`}
              />
            </div>
            <div>
              <label className={label}>OG Image URL</label>
              <input
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="Optional social share image"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Canonical URL</label>
              <input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="Optional; defaults to /blog/slug"
                className={field}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#3c434a]">
              <input
                type="checkbox"
                checked={noindex}
                onChange={(e) => setNoindex(e.target.checked)}
                className="wp-checkbox"
              />
              Noindex (hide from search engines)
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="wp-panel">
          <div className="wp-panel-header">Publishing</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1.5">
              {(
                [
                  { key: "draft", label: "Draft" },
                  { key: "published", label: "Publish Now" },
                  { key: "scheduled", label: "Schedule" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                    status === opt.key
                      ? "border-[#2271b1] bg-[#f0f6fc] font-semibold text-[#2271b1]"
                      : "border-[#e2e2e2] text-[#3c434a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={status === opt.key}
                    onChange={() => setStatus(opt.key)}
                    className="accent-[#2271b1]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {status === "scheduled" && (
              <div>
                <label className={label}>Schedule Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={field}
                  required={status === "scheduled"}
                />
                <p className="mt-1 text-xs text-[#646970]">
                  The post auto-publishes when the time arrives.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">Organization</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div>
              <label className={label}>Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={field}
              >
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Author</label>
              <select
                value={authorId}
                onChange={(e) => {
                  setAuthorId(e.target.value);
                  const author = authors.find((a) => a.id === e.target.value);
                  if (author) {
                    setAuthorName(author.name);
                    setAuthorRole(author.role ?? "");
                  }
                }}
                className={field}
              >
                <option value="">— Select —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Author Name (fallback)</label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Author Role (fallback)</label>
              <input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Tags (comma separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                list="blog-tags-list"
                className={field}
              />
              <datalist id="blog-tags-list">
                {allTags.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">Badges &amp; Meta</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div>
              <label className={label}>Reading Time</label>
              <input
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                placeholder="e.g. 6 min read"
                className={field}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  { key: "featured", label: "Featured", on: isFeatured, set: setIsFeatured },
                  { key: "popular", label: "Popular", on: isPopular, set: setIsPopular },
                  { key: "trending", label: "Trending", on: isTrending, set: setIsTrending },
                  { key: "editors", label: "Editor's Pick", on: isEditorsPick, set: setIsEditorsPick },
                ] as const
              ).map((b) => (
                <label key={b.key} className="flex items-center gap-2 text-sm text-[#3c434a]">
                  <input
                    type="checkbox"
                    checked={b.on}
                    onChange={(e) => b.set(e.target.checked)}
                    className="wp-checkbox"
                  />
                  {b.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">Recommendations</div>
          <div className="wp-panel-body grid grid-cols-1 gap-3">
            <div>
              <label className={label}>Related Course</label>
              <select
                value={relatedCourseId}
                onChange={(e) => setRelatedCourseId(e.target.value)}
                className={field}
              >
                <option value="">— None —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Related Products</label>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded border border-[#c3c4c7] p-2">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 rounded px-2 py-1 text-sm text-[#3c434a] hover:bg-[#f0f0f1]"
                  >
                    <input
                      type="checkbox"
                      checked={relatedProductIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="wp-checkbox"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-body flex flex-col gap-2">
            <button
              type="submit"
              disabled={pending}
              className="wp-btn wp-btn-primary"
            >
              <i className="fa-solid fa-floppy-disk" />
              {pending
                ? "Saving..."
                : status === "published"
                  ? "Publish Post"
                  : status === "scheduled"
                    ? "Schedule Post"
                    : "Save Draft"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void save("draft")}
                disabled={pending}
                className="wp-btn flex-1"
              >
                Save Draft
              </button>
              {post && (
                <a
                  href={`/admin/blog/preview/${post.id}`}
                  target="_blank"
                  className="wp-btn flex-1"
                >
                  <i className="fa-solid fa-eye" /> Preview
                </a>
              )}
            </div>
            <a
              href="/admin/blog/posts"
              className="wp-btn text-center"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}