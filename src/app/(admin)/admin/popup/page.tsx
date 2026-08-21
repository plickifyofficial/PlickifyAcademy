import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/content-editor";
import { findSection, popupDefaults } from "@/lib/content-schema";
import { readSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminPopupPage() {
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

  const section = findSection("global.popup");
  if (!section) return null;

  const initial = await readSiteContent(
    section.key,
    section.defaults as Record<string, unknown>,
  );

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Popup Banner</h1>
      <p className="wp-subtitle">
        Show a popup to visitors after a few seconds — perfect for special
        offers and announcements.
      </p>

      <div className="mt-6">
        <ContentEditor sections={[section]} initial={{ [section.key]: initial }} />
      </div>
    </div>
  );
}
