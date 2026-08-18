import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/content-editor";
import { pageSections } from "@/lib/content-schema";
import { readSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AdminPagesEditorPage() {
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
  for (const section of pageSections) {
    initial[section.key] = await readSiteContent(
      section.key,
      section.defaults as Record<string, unknown>,
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Pages</h1>
      <p className="wp-subtitle">
        Edit content for the FAQ, Terms & Conditions, Privacy Policy, and
        Refund Policy pages — like WordPress. Changes update the pages
        immediately after saving.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/faq" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> View FAQ
        </a>
        <a href="/terms" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> View Terms
        </a>
        <a href="/privacy" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> View Privacy
        </a>
        <a href="/refund" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> View Refund
        </a>
      </div>

      <div className="mt-6">
        <ContentEditor sections={pageSections} initial={initial} />
      </div>
    </div>
  );
}