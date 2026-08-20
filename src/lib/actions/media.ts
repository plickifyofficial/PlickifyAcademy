"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";

export type MediaFile = {
  name: string;
  bucket: string;
  url: string;
  size: number;
  mimetype: string | null;
  created_at: string | null;
};

const MEDIA_BUCKETS = ["site-assets", "course-images"] as const;
const MAX_IMAGE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

export async function listMedia(): Promise<MediaFile[]> {
  await requireAdmin();

  const admin = createAdminClient();
  const files: MediaFile[] = [];

  for (const bucket of MEDIA_BUCKETS) {
    const { data, error } = await admin.storage.from(bucket).list();
    if (error) continue;
    for (const f of data) {
      if (!f.metadata || Number(f.metadata.size) === 0) continue;
      const url = admin.storage.from(bucket).getPublicUrl(f.name).data.publicUrl;
      files.push({
        name: f.name,
        bucket,
        url,
        size: Number(f.metadata.size) ?? 0,
        mimetype: (f.metadata.mimetype as string) ?? null,
        created_at: (f.created_at as string) ?? null,
      });
    }
  }

  return files.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function uploadMedia(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file selected");
  if (file.size === 0) throw new Error("Empty file");
  if (file.size > MAX_IMAGE) throw new Error("Image must be under 2MB");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only PNG, JPG, WebP, SVG or GIF images are allowed");
  }

  const bucket = String(formData.get("bucket") || "site-assets");
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `content-${Date.now()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const url = admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  revalidatePath("/admin/media");
  return { url };
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();

  const bucket = String(formData.get("bucket"));
  const path = String(formData.get("path"));

  if (!bucket || !path) throw new Error("File path missing");

  const admin = createAdminClient();
  const { error } = await admin.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/media");
}
