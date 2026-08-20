import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { blogSettingsDefaults, type BlogSettingsContent } from "@/lib/content-schema";
import { BlogSettingsForm } from "@/components/admin/blog/blog-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminBlogSettingsPage() {
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
  const [siteContent, categories, authors] = await Promise.all([
    admin.from("site_content").select("*").eq("key", "blog.settings").maybeSingle(),
    admin.from("blog_categories").select("id,name").order("sort_order", { ascending: true }).limit(200),
    admin.from("blog_authors").select("id,name").order("name", { ascending: true }).limit(200),
  ]);

  const saved = siteContent.data?.value as Partial<BlogSettingsContent> | null;
  const settings: BlogSettingsContent = {
    ...blogSettingsDefaults,
    ...(saved ?? {}),
  };

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Blog Settings</h1>
      <p className="wp-subtitle">
        Control the blog&apos;s public behavior — pagination, comments, sharing and feature toggles.
      </p>
      <div className="mt-6">
        <BlogSettingsForm
          settings={settings}
          categories={(categories.data ?? []) as never}
          authors={(authors.data ?? []) as never}
        />
      </div>
    </div>
  );
}