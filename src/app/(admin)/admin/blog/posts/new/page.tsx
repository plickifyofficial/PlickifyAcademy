import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostEditor } from "@/components/admin/blog/post-editor";

export const dynamic = "force-dynamic";

export default async function AdminBlogPostNewPage() {
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
  const [categories, authors, tags, courses, products] = await Promise.all([
    admin.from("blog_categories").select("*").order("sort_order", { ascending: true }).limit(200),
    admin.from("blog_authors").select("*").order("name", { ascending: true }).limit(200),
    admin.from("blog_tags").select("*").order("name", { ascending: true }).limit(200),
    admin.from("courses").select("id,title,slug").eq("is_published", true).limit(200),
    admin.from("products").select("id,name,slug").eq("is_published", true).limit(200),
  ]);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Add New Post</h1>
      <p className="wp-subtitle">Write in markdown — it will render beautifully on the blog.</p>
      <div className="mt-6">
        <PostEditor
          post={null}
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