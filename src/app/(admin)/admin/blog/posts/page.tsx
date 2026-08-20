import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostsManager } from "@/components/admin/blog/posts-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPostsPage() {
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
  const [posts, categories] = await Promise.all([
    admin.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(500),
    admin.from("blog_categories").select("*").order("sort_order", { ascending: true }).limit(200),
  ]);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="wp-page-title">Blog Posts</h1>
          <p className="wp-subtitle">
            Create and manage articles. Body supports markdown — headings,
            lists, quotes, code and links render on the public site.
          </p>
        </div>
        <Link href="/admin/blog" className="wp-btn">
          <i className="fa-solid fa-arrow-left" /> Dashboard
        </Link>
      </div>
      <div className="mt-6">
        <PostsManager
          items={(posts.data ?? []) as never}
          categories={(categories.data ?? []) as never}
        />
      </div>
    </div>
  );
}