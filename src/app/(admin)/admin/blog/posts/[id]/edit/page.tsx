import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostEditor } from "@/components/admin/blog/post-editor";

export const dynamic = "force-dynamic";

export default async function AdminBlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const [post, categories, authors, tags, courses, products] = await Promise.all([
    admin.from("blog_posts").select("*").eq("id", id).maybeSingle(),
    admin.from("blog_categories").select("*").order("sort_order", { ascending: true }).limit(200),
    admin.from("blog_authors").select("*").order("name", { ascending: true }).limit(200),
    admin.from("blog_tags").select("*").order("name", { ascending: true }).limit(200),
    admin.from("courses").select("id,title,slug").eq("is_published", true).limit(200),
    admin.from("products").select("id,name,slug").eq("is_published", true).limit(200),
  ]);

  if (!post.data) notFound();

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Edit Post</h1>
      <p className="wp-subtitle">Modify the article, then save a draft or publish.</p>
      <div className="mt-6">
        <PostEditor
          post={post.data as never}
          categories={(categories.data ?? []) as never}
          authors={(authors.data ?? []) as never}
          allTags={(tags.data ?? []) as never}
          courses={(courses.data ?? []) as never}
          products={(products.data ?? []) as never}
        />
      </div>
    </div>
  );
}