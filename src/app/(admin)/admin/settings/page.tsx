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
    .select("site_name, tagline, logo_url, favicon_url")
    .eq("id", 1)
    .single();

  const defaults = {
    site_name: "Plickify Academy",
    tagline: "Learn, grow up",
    logo_url: null as string | null,
    favicon_url: null as string | null,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="wp-page-title">Site Settings</h1>
      <p className="wp-subtitle">
        Change the logo, favicon, and site name — updates instantly
        everywhere.
      </p>

      <SiteSettingsForm settings={settings ?? defaults} />
    </div>
  );
}