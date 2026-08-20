import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthorsManager } from "@/components/admin/blog/authors-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogAuthorsPage() {
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
  const [authors, postCounts] = await Promise.all([
    admin.from("blog_authors").select("*").order("name", { ascending: true }).limit(200),
    admin
      .from("blog_posts")
      .select("author_id")
      .eq("status", "published"),
  ]);

  const counts: Record<string, number> = {};
  for (const p of postCounts.data ?? []) {
    if (p.author_id) counts[p.author_id] = (counts[p.author_id] ?? 0) + 1;
  }
  const items = (authors.data ?? []).map((a) => ({
    ...a,
    posts: counts[a.id] ? [{}] : [],
  }));

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Authors</h1>
      <p className="wp-subtitle">
        Manage article authors and their profiles. Authors get their own /blog/author/slug archive.
      </p>
      <div className="mt-6">
        <AuthorsManager items={items as never} />
      </div>
    </div>
  );
}