import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CategoriesManager } from "@/components/admin/blog/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogCategoriesPage() {
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
  const { data } = await admin
    .from("blog_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(200);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Categories</h1>
      <p className="wp-subtitle">
        Organize posts into categories. Each category gets its own /blog/category/slug archive.
      </p>
      <div className="mt-6">
        <CategoriesManager items={(data ?? []) as never} />
      </div>
    </div>
  );
}