import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostsTable } from "@/components/admin/posts-table";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
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

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Blog Posts</h1>
      <p className="wp-subtitle">
        Write articles for the blog. The body supports markdown — headings,
        lists, bold text and links will render on the public site.
      </p>
      <div className="mt-6">
        <PostsTable items={(data ?? []) as never} />
      </div>
    </div>
  );
}