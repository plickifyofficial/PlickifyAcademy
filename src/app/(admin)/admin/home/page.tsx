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
      <h1 className="wp-page-title">হোম পেজ ও সাইট কনটেন্ট</h1>
      <p className="wp-subtitle">
        WordPress-এর মতো প্রতিটা সেকশন এডিট করুন — হিরো, স্ট্যাটস, ফিচার্ড
        কোর্স, FAQ, ফুটার, নেভিগেশন সবকিছু। সেভ করার সাথে সাথেই ওয়েবসাইটে
        আপডেট হয়ে যায়।
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/" target="_blank" className="wp-btn">
          <i className="fa-solid fa-globe" /> সাইট প্রিভিউ
        </a>
        <a href="/admin/media" className="wp-btn">
          <i className="fa-solid fa-images" /> মিডিয়া লাইব্রেরি
        </a>
      </div>

      <div className="mt-6">
        <ContentEditor sections={allSections} initial={initial} />
      </div>
    </div>
  );
}
