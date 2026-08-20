import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  contactSettingsDefaults,
  type ContactSettingsContent,
} from "@/lib/content-schema";

export const contactSettingsTag = "contact-settings";

export async function readContactSettings(): Promise<ContactSettingsContent> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "contact.settings")
      .maybeSingle();
    const saved = (data?.value ?? {}) as Partial<ContactSettingsContent>;
    return {
      ...contactSettingsDefaults,
      ...saved,
      placement: {
        ...contactSettingsDefaults.placement,
        ...(saved.placement ?? {}),
      },
      businessHours:
        Array.isArray(saved.businessHours) && saved.businessHours.length > 0
          ? saved.businessHours
          : contactSettingsDefaults.businessHours,
    } as ContactSettingsContent;
  } catch {
    return { ...contactSettingsDefaults } as ContactSettingsContent;
  }
}

export const getContactSettings = unstable_cache(
  readContactSettings,
  ["contact-settings"],
  { revalidate: 60, tags: [contactSettingsTag] },
);