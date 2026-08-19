import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const settingsTag = "site-settings";

export type SiteSettings = {
  id: number;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  bkash_number: string | null;
  nagad_number: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_instagram: string | null;
  social_telegram: string | null;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  updated_at: string;
};

export async function readSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return null;
    return data as SiteSettings;
  } catch {
    return null;
  }
}

export const getSiteSettings = unstable_cache(
  readSiteSettings,
  ["site-settings"],
  { revalidate: 60, tags: [settingsTag] },
);