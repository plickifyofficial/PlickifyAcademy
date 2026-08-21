import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContentEditor } from "@/components/admin/content-editor";
import { SectionManager } from "@/components/admin/section-manager";
import { CustomSectionsManager } from "@/components/admin/custom-sections-manager";
import { DraftsBar } from "@/components/admin/drafts-bar";
import {
  allSections,
  customSectionsDefaults,
  homeSectionLabels,
  sectionsMetaDefaults,
} from "@/lib/content-schema";
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

  const sectionsMeta = await readSiteContent(
    "home.sections_meta",
    sectionsMetaDefaults,
  );
  const customSections = await readSiteContent(
    "home.custom_sections",
    customSectionsDefaults,
  );

  const admin = createAdminClient();
  const { data: draftRows } = await admin
    .from("site_content_drafts")
    .select("key, updated_at")
    .order("updated_at", { ascending: false });

  const labels: Record<string, string> = {
    ...homeSectionLabels,
    ...Object.fromEntries(allSections.map((s) => [s.key, s.title])),
  };
  const drafts = (draftRows ?? []).map((d) => ({
    key: d.key,
    label: labels[d.key] ?? d.key,
    updatedAt: d.updated_at,
  }));

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
        <DraftsBar drafts={drafts} />
      </div>

      <div className="mt-6">
        <SectionManager
          initialOrder={sectionsMeta.order}
          initialHidden={sectionsMeta.hidden}
          labels={homeSectionLabels}
        />
      </div>

      <div className="mt-6">
        <CustomSectionsManager initialItems={customSections.items} />
      </div>

      <div className="mt-6">
        <ContentEditor sections={allSections} initial={initial} />
      </div>
    </div>
  );
}
