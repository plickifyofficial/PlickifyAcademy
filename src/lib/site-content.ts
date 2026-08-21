import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

function deepMerge<T>(defaults: T, incoming: unknown): T {
  if (!incoming || typeof incoming !== "object") return defaults;
  if (Array.isArray(incoming)) return incoming as T;
  if (Array.isArray(defaults)) return incoming as T;

  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [k, v] of Object.entries(incoming as Record<string, unknown>)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      out[k] &&
      typeof out[k] === "object" &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export async function readSiteContent<T>(key: string, defaults: T): Promise<T> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) return defaults;
    if (!data?.value) return defaults;
    return deepMerge(defaults, data.value);
  } catch {
    return defaults;
  }
}

export const getSiteContent = unstable_cache(
  async <T>(key: string, defaults: T): Promise<T> => readSiteContent(key, defaults),
  ["site-content"],
  { revalidate: 60 },
);

// Draft-aware read for the admin preview page (uncached).
export async function readSiteContentWithDraft<T>(
  key: string,
  defaults: T,
): Promise<T> {
  try {
    const supabase = createAdminClient();
    const { data: draft } = await supabase
      .from("site_content_drafts")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (draft?.value) return deepMerge(defaults, draft.value);
    return readSiteContent(key, defaults);
  } catch {
    return readSiteContent(key, defaults);
  }
}
