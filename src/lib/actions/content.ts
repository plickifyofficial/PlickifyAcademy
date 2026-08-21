"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";
import { sanitizeHtml } from "@/lib/rte";

const MAX_IMAGE = 2 * 1024 * 1024;
const ALLOWED_IMAGE = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

const MAX_REVISIONS_PER_KEY = 20;

export async function saveSectionContent(key: string, value: unknown) {
  await requireAdmin();
  if (!key) throw new Error("Section key is missing");

  const admin = createAdminClient();

  // Snapshot the current value before overwriting (revision history).
  const { data: current } = await admin
    .from("site_content")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (current?.value) {
    await admin.from("site_content_revisions").insert({
      key,
      value: current.value,
    });

    // Keep only the latest N revisions per key.
    const { data: all } = await admin
      .from("site_content_revisions")
      .select("id")
      .eq("key", key)
      .order("created_at", { ascending: false });

    const stale = (all ?? []).slice(MAX_REVISIONS_PER_KEY).map((r) => r.id);
    if (stale.length > 0) {
      await admin.from("site_content_revisions").delete().in("id", stale);
    }
  }

  const { error } = await admin
    .from("site_content")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
  return { ok: true };
}

export async function restoreRevision(revisionId: string) {
  await requireAdmin();
  if (!revisionId) throw new Error("Revision id is missing");

  const admin = createAdminClient();
  const { data: revision } = await admin
    .from("site_content_revisions")
    .select("key, value")
    .eq("id", revisionId)
    .maybeSingle();

  if (!revision) throw new Error("Revision not found");

  return saveSectionContent(revision.key, revision.value);
}

export async function getRevisionValue(revisionId: string) {
  await requireAdmin();
  if (!revisionId) throw new Error("Revision id is missing");

  const admin = createAdminClient();
  const { data } = await admin
    .from("site_content_revisions")
    .select("key, value")
    .eq("id", revisionId)
    .maybeSingle();

  if (!data) throw new Error("Revision not found");
  return { key: data.key, value: data.value };
}

// ============================================================
// DRAFTS (Save Draft / Preview / Publish)
// ============================================================

export async function saveSectionDraft(key: string, value: unknown) {
  await requireAdmin();
  if (!key) throw new Error("Section key is missing");

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_content_drafts")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/preview");
  revalidatePath("/admin/home");
  return { ok: true };
}

export async function publishDraft(key: string) {
  await requireAdmin();
  if (!key) throw new Error("Section key is missing");

  const admin = createAdminClient();
  const { data: draft } = await admin
    .from("site_content_drafts")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (!draft) throw new Error("Draft not found");

  await saveSectionContent(key, draft.value);

  const { error } = await admin
    .from("site_content_drafts")
    .delete()
    .eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/home");
  return { ok: true };
}

export async function publishAllDrafts() {
  await requireAdmin();

  const admin = createAdminClient();
  const { data: drafts } = await admin
    .from("site_content_drafts")
    .select("key");

  for (const d of drafts ?? []) {
    await publishDraft(d.key);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/home");
  return { ok: true, count: (drafts ?? []).length };
}

export async function discardDraft(key: string) {
  await requireAdmin();
  if (!key) throw new Error("Section key is missing");

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_content_drafts")
    .delete()
    .eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/home");
  return { ok: true };
}

export async function saveSectionsMeta(
  order: string[],
  hidden: string[],
  devices?: Record<string, { desktop: boolean; tablet: boolean; mobile: boolean }>,
) {
  await requireAdmin();

  const validKeys = [
    "home.hero",
    "home.stats",
    "home.tools",
    "home.skills",
    "home.featured",
    "home.our_courses",
    "home.why",
    "home.process",
    "home.live_batch",
    "home.products",
    "home.testimonials",
    "home.faq",
    "home.cta",
  ];

  const cleanOrder = order.filter((k) => validKeys.includes(k));
  for (const k of validKeys) {
    if (!cleanOrder.includes(k)) cleanOrder.push(k);
  }
  const cleanHidden = hidden.filter((k) => validKeys.includes(k));

  const cleanDevices: Record<
    string,
    { desktop: boolean; tablet: boolean; mobile: boolean }
  > = {};
  if (devices) {
    for (const [k, v] of Object.entries(devices)) {
      if (!validKeys.includes(k) || !v || typeof v !== "object") continue;
      cleanDevices[k] = {
        desktop: v.desktop !== false,
        tablet: v.tablet !== false,
        mobile: v.mobile !== false,
      };
    }
  }

  return saveSectionContent("home.sections_meta", {
    order: cleanOrder,
    hidden: cleanHidden,
    devices: cleanDevices,
  });
}

export type CustomSectionItem = {
  id: string;
  title: string;
  eyebrow: string;
  body: string;
  visible: boolean;
};

export async function saveCustomSections(items: CustomSectionItem[]) {
  await requireAdmin();

  const clean = items
    .filter((s) => s && typeof s.id === "string" && s.id)
    .slice(0, 20)
    .map((s) => ({
      id: s.id,
      title: String(s.title ?? "").slice(0, 200),
      eyebrow: String(s.eyebrow ?? "").slice(0, 100),
      body: sanitizeHtml(String(s.body ?? "")),
      visible: s.visible !== false,
    }));

  return saveSectionContent("home.custom_sections", { items: clean });
}

export async function saveSeoOverrides(
  pages: Record<string, { title?: string; description?: string }>,
) {
  await requireAdmin();

  const { SEO_PAGES } = await import("@/lib/seo");
  const validPaths = new Set(SEO_PAGES.map((p) => p.path));

  const clean: Record<string, { title: string; description: string }> = {};
  for (const [path, v] of Object.entries(pages ?? {})) {
    if (!validPaths.has(path) || !v || typeof v !== "object") continue;
    const title = String(v.title ?? "").trim().slice(0, 200);
    const description = String(v.description ?? "").trim().slice(0, 320);
    if (!title && !description) continue;
    clean[path] = { title, description };
  }

  return saveSectionContent("global.seo_overrides", clean);
}

export async function uploadContentImage(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    throw new Error("Please select a file");

  if (file.size > MAX_IMAGE) throw new Error("Image must be within 2MB");
  if (!ALLOWED_IMAGE.includes(file.type))
    throw new Error("Please provide a PNG/JPG/WebP/SVG/GIF image");

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `content-${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("site-assets")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from("site-assets").getPublicUrl(path);
  return { url: data.publicUrl };
}
