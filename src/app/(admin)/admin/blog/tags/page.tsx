import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TagsManager } from "@/components/admin/blog/tags-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogTagsPage() {
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
    .from("blog_tags")
    .select("*")
    .order("name", { ascending: true })
    .limit(200);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Tags</h1>
      <p className="wp-subtitle">
        Manage topic tags. Tags can also be created automatically when you type them in the post editor.
      </p>
      <div className="mt-6">
        <TagsManager items={(data ?? []) as never} />
      </div>
    </div>
  );
}