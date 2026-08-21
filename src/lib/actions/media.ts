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
  display_name: string | null;
  alt_text: string | null;
  caption: string | null;
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

  // Load saved metadata (display name / alt text / caption).
  const { data: metaRows } = await admin
    .from("media_files")
    .select("bucket, path, display_name, alt_text, caption");
  const meta = new Map(
    (metaRows ?? []).map((m) => [`${m.bucket}/${m.path}`, m]),
  );

  for (const bucket of MEDIA_BUCKETS) {
    const { data, error } = await admin.storage.from(bucket).list();
    if (error) continue;
    for (const f of data) {
      if (!f.metadata || Number(f.metadata.size) === 0) continue;
      const url = admin.storage.from(bucket).getPublicUrl(f.name).data.publicUrl;
      const m = meta.get(`${bucket}/${f.name}`);
      files.push({
        name: f.name,
        bucket,
        url,
        size: Number(f.metadata.size) ?? 0,
        mimetype: (f.metadata.mimetype as string) ?? null,
        created_at: (f.created_at as string) ?? null,
        display_name: m?.display_name ?? null,
        alt_text: m?.alt_text ?? null,
        caption: m?.caption ?? null,
      });
    }
  }

  return files.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}

export async function saveMediaMeta(
  bucket: string,
  path: string,
  meta: {
    displayName?: string;
    altText?: string;
    caption?: string;
  },
) {
  await requireAdmin();
  if (!MEDIA_BUCKETS.includes(bucket as (typeof MEDIA_BUCKETS)[number])) {
    throw new Error("Invalid bucket");
  }
  if (!path) throw new Error("File path missing");

  const admin = createAdminClient();
  const { error } = await admin
    .from("media_files")
    .upsert(
      {
        bucket,
        path,
        display_name: (meta.displayName ?? "").slice(0, 200),
        alt_text: (meta.altText ?? "").slice(0, 300),
        caption: (meta.caption ?? "").slice(0, 500),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "bucket,path" },
    );
  if (error) throw new Error(error.message);

  revalidatePath("/admin/media");
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
