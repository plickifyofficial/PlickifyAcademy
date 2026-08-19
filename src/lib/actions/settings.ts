"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";
import { settingsTag } from "@/lib/settings";

const MAX_SIZE = 2 * 1024 * 1024;

const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];

async function uploadImage(
  bucket: string,
  prefix: string,
  file: File,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${prefix}-${Date.now()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function validImage(file: File) {
  return (
    file.size > 0 &&
    file.size <= MAX_SIZE &&
    ALLOWED_MIME.includes(file.type)
  );
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

export async function saveSiteSettings(formData: FormData) {
  await requireAdmin();

  const siteName = text(formData, "site_name") || "Plickify Academy";
  const tagline = text(formData, "tagline");

  const updates: Record<string, unknown> = {
    site_name: siteName,
    tagline,
    bkash_number: text(formData, "bkash_number"),
    nagad_number: text(formData, "nagad_number"),
    seo_title: text(formData, "seo_title"),
    seo_description: text(formData, "seo_description"),
    social_facebook: text(formData, "social_facebook"),
    social_youtube: text(formData, "social_youtube"),
    social_linkedin: text(formData, "social_linkedin"),
    social_instagram: text(formData, "social_instagram"),
    social_telegram: text(formData, "social_telegram"),
    maintenance_mode: formData.get("maintenance_mode") === "on",
    maintenance_message: text(formData, "maintenance_message"),
    updated_at: new Date().toISOString(),
  };

  const logo = formData.get("logo_file");
  if (logo instanceof File && logo.size > 0) {
    if (!validImage(logo)) throw new Error("Logo: provide a PNG/JPG/WebP/SVG within 2MB");
    updates.logo_url = await uploadImage("site-assets", "logo", logo);
  }

  const favicon = formData.get("favicon_file");
  if (favicon instanceof File && favicon.size > 0) {
    if (!validImage(favicon)) throw new Error("Favicon: provide a PNG/JPG/WebP/SVG within 2MB");
    updates.favicon_url = await uploadImage("site-assets", "favicon", favicon);
  }

  const ogImage = formData.get("og_image_file");
  if (ogImage instanceof File && ogImage.size > 0) {
    if (!validImage(ogImage)) throw new Error("OG image: provide a PNG/JPG/WebP/SVG within 2MB");
    updates.og_image = await uploadImage("site-assets", "og", ogImage);
  } else {
    const ogUrl = text(formData, "og_image");
    if (ogUrl) updates.og_image = ogUrl;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .update(updates)
    .eq("id", 1);

  if (error) throw new Error(error.message);

  updateTag(settingsTag);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}