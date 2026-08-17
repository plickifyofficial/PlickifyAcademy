"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";

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

export async function saveSiteSettings(formData: FormData) {
  await requireAdmin();

  const siteName = String(formData.get("site_name")).trim() || "Plickify Academy";
  const tagline = String(formData.get("tagline")).trim();

  const updates: Record<string, string> = {
    site_name: siteName,
    tagline,
    updated_at: new Date().toISOString(),
  };

  const logo = formData.get("logo_file");
  if (logo instanceof File && logo.size > 0) {
    if (!validImage(logo)) throw new Error("Logo: PNG/JPG/WebP/SVG 2MB-এর মধ্যে দিন");
    updates.logo_url = await uploadImage("site-assets", "logo", logo);
  }

  const favicon = formData.get("favicon_file");
  if (favicon instanceof File && favicon.size > 0) {
    if (!validImage(favicon)) throw new Error("Favicon: PNG/JPG/WebP/SVG 2MB-এর মধ্যে দিন");
    updates.favicon_url = await uploadImage("site-assets", "favicon", favicon);
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("site_settings")
    .update(updates)
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings");
}