import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CommentsManager } from "@/components/admin/blog/comments-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogCommentsPage() {
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
  const [comments, posts] = await Promise.all([
    admin.from("blog_comments").select("*").order("created_at", { ascending: false }).limit(500),
    admin.from("blog_posts").select("id,title").limit(500),
  ]);

  const postTitles: Record<string, string> = {};
  for (const p of posts.data ?? []) postTitles[p.id] = p.title;

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Comments</h1>
      <p className="wp-subtitle">
        Moderate reader comments. Approve keeps them visible on the article page; reject and spam hide them.
      </p>
      <div className="mt-6">
        <CommentsManager
          items={(comments.data ?? []) as never}
          postTitles={postTitles}
        />
      </div>
    </div>
  );
}