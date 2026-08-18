import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/content-editor";
import { allSections } from "@/lib/content-schema";
import { readSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminHomeEditorPage() {
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

  const initial: Record<string, Record<string, unknown>> = {};
  for (const section of allSections) {
    initial[section.key] = await readSiteContent(
      section.key,
      section.defaults as Record<string, unknown>,
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Home Page & Site Content</h1>
      <p className="wp-subtitle">
        Edit every section like WordPress — hero, stats, featured courses,
        FAQ, footer, navigation, everything. Changes update the website
        immediately after saving.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> Preview Site
        </a>
        <a href="/admin/media" className="wp-btn">
          <i className="fa-solid fa-images" /> Media Library
        </a>
      </div>

      <div className="mt-6">
        <ContentEditor sections={allSections} initial={initial} />
      </div>
    </div>
  );
}
