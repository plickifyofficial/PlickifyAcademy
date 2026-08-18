"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";

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
