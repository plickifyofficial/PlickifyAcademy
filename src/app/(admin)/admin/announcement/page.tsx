import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/content-editor";
import { findSection, announcementDefaults } from "@/lib/content-schema";
import { readSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementPage() {
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

  const section = findSection("global.announcement");
  if (!section) return null;

  const initial = await readSiteContent(
    section.key,
    section.defaults as Record<string, unknown>,
  );

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Announcement Bar</h1>
      <p className="wp-subtitle">
        Show a site-wide banner above the header — for offers, news or
        important notices.
      </p>

      <div className="mt-6">
        <ContentEditor sections={[section]} initial={{ [section.key]: initial }} />
      </div>
    </div>
  );
}
