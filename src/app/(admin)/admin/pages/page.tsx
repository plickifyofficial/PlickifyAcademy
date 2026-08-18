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
      <h1 className="wp-page-title">পেজসমূহ (Pages)</h1>
      <p className="wp-subtitle">
        FAQ, Terms & Conditions, Privacy Policy ও Refund Policy পেজের
        কনটেন্ট এডিট করুন — WordPress-এর মতো। সেভ করার সাথে সাথেই পেজে
        আপডেট হয়ে যায়।
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/faq" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> FAQ দেখুন
        </a>
        <a href="/terms" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> Terms দেখুন
        </a>
        <a href="/privacy" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> Privacy দেখুন
        </a>
        <a href="/refund" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> Refund দেখুন
        </a>
      </div>

      <div className="mt-6">
        <ContentEditor sections={pageSections} initial={initial} />
      </div>
    </div>
  );
}