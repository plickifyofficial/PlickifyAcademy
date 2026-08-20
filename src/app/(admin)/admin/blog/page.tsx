import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminBlogDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [posts, categories, authors, comments] = await Promise.all([
    admin.from("blog_posts").select("*").limit(200),
    admin.from("blog_categories").select("*").limit(200),
    admin.from("blog_authors").select("*").limit(200),
    admin.from("blog_comments").select("*").limit(500),
  ]);

  const allPosts = (posts.data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    is_published: boolean;
    view_count: number | null;
    published_at: string | null;
    created_at: string | null;
  }>;

  const published = allPosts.filter((p) => p.status === "published" || p.is_published);
  const drafts = allPosts.filter((p) => p.status === "draft");
  const scheduled = allPosts.filter((p) => p.status === "scheduled");
  const allComments = comments.data ?? [];
  const pendingComments = allComments.filter((c) => c.status === "pending");
  const totalViews = allPosts.reduce((s, p) => s + (p.view_count ?? 0), 0);

  const popular = [...allPosts]
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 5);
  const recent = [...allPosts]
    .sort(
      (a, b) =>
        new Date(b.published_at ?? b.created_at ?? "").getTime() -
        new Date(a.published_at ?? a.created_at ?? "").getTime(),
    )
    .slice(0, 5);

  const stats = [
    { label: "Total Posts", value: allPosts.length, icon: "fa-file-lines", to: "/admin/blog/posts" },
    { label: "Published", value: published.length, icon: "fa-check-circle", to: "/admin/blog/posts" },
    { label: "Drafts", value: drafts.length, icon: "fa-pen-to-square", to: "/admin/blog/posts" },
    { label: "Scheduled", value: scheduled.length, icon: "fa-clock", to: "/admin/blog/posts" },
    { label: "Categories", value: (categories.data ?? []).length, icon: "fa-folder", to: "/admin/blog/categories" },
    { label: "Authors", value: (authors.data ?? []).length, icon: "fa-user-pen", to: "/admin/blog/authors" },
    { label: "Total Views", value: totalViews, icon: "fa-eye", to: "/admin/blog/posts" },
    { label: "Comments", value: allComments.length, icon: "fa-comment-dots", to: "/admin/blog/comments" },
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="wp-page-title">Blog Dashboard</h1>
          <p className="wp-subtitle">
            Manage articles, categories, tags, authors, comments and blog settings.
          </p>
        </div>
        <Link href="/admin/blog/posts/new" className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-plus" /> New Post
        </Link>
      </div>

      {pendingComments.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>
            {pendingComments.length} comment{pendingComments.length > 1 ? "s" : ""} awaiting moderation.
          </span>
          <Link href="/admin/blog/comments" className="ml-auto font-semibold underline">
            Review now
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.to}
            className="rounded-xl border border-[#e2e2e2] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#646970]">{s.label}</p>
              <i className={`fa-solid ${s.icon} text-[#2271b1]`} />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#1d2327]">
              {s.value.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="wp-panel">
          <div className="wp-panel-header">Popular Posts</div>
          <div className="divide-y divide-[#f0f0f1]">
            {popular.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/admin/blog/posts/${p.id}/edit`}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-[#1d2327] hover:text-[#2271b1]"
                >
                  {p.title}
                </Link>
                <span className="flex shrink-0 items-center gap-1 text-xs text-[#646970]">
                  <i className="fa-solid fa-eye" /> {p.view_count ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">Recent Posts</div>
          <div className="divide-y divide-[#f0f0f1]">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link
                  href={`/admin/blog/posts/${p.id}/edit`}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-[#1d2327] hover:text-[#2271b1]"
                >
                  {p.title}
                </Link>
                <span
                  className={`wp-tag border-0 ${
                    p.status === "published"
                      ? "wp-tag-green"
                      : p.status === "scheduled"
                        ? "wp-tag-blue"
                        : "wp-tag-gray"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}