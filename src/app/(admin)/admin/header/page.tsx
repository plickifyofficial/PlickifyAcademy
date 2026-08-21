import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/content-editor";
import { findSection, navDefaults } from "@/lib/content-schema";
import { readSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminHeaderPage() {
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

  const section = findSection("global.nav");
  if (!section) return null;

  const initial = await readSiteContent(
    section.key,
    section.defaults as Record<string, unknown>,
  );

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Header & Navigation</h1>
      <p className="wp-subtitle">
        Edit the top navigation menu links shown on every page.
      </p>

      <div className="mt-6">
        <ContentEditor sections={[section]} initial={{ [section.key]: initial }} />
      </div>
    </div>
  );
}
