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

export async function saveSectionContent(key: string, value: unknown) {
  await requireAdmin();
  if (!key) throw new Error("Section key is missing");

  const admin = createAdminClient();
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

export async function saveSectionsMeta(order: string[], hidden: string[]) {
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

  return saveSectionContent("home.sections_meta", {
    order: cleanOrder,
    hidden: cleanHidden,
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
