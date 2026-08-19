import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
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

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const defaults = {
    site_name: "Plickify Academy",
    tagline: "Learn, grow up",
    logo_url: null as string | null,
    favicon_url: null as string | null,
    bkash_number: null as string | null,
    nagad_number: null as string | null,
    seo_title: null as string | null,
    seo_description: null as string | null,
    og_image: null as string | null,
    social_facebook: null as string | null,
    social_youtube: null as string | null,
    social_linkedin: null as string | null,
    social_instagram: null as string | null,
    social_telegram: null as string | null,
    maintenance_mode: false as boolean,
    maintenance_message: null as string | null,
  };

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Site Settings</h1>
      <p className="wp-subtitle">
        Site identity, payment numbers, SEO defaults and maintenance mode —
        updates apply instantly.
      </p>

      <SiteSettingsForm settings={{ ...defaults, ...settings }} />
    </div>
  );
}