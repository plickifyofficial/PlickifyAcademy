import { createAdminClient } from "@/lib/supabase/admin";
import { MediaDeleteButton } from "@/components/admin/media-delete-button";

export const metadata = { title: "মিডিয়া লাইব্রেরি" };
export const dynamic = "force-dynamic";

type MediaFile = {
  id: string;
  name: string;
  bucket: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
};

async function listBucket(bucket: string): Promise<MediaFile[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.storage.from(bucket).list();
    if (!data) return [];

    return data
      .filter((f) => (f.metadata?.size ?? 0) > 0)
      .map((f) => ({
        id: f.id ?? `${f.name}-${Math.random()}`,
        name: f.name,
        bucket,
        url: admin.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
        size: f.metadata?.size ?? 0,
        type: f.metadata?.mimetype ?? "image",
        created_at: f.created_at ?? "",
      }));
  } catch {
    return [];
  }
}

export default async function AdminMediaPage() {
  const [siteAssets, courseImages] = await Promise.all([
    listBucket("site-assets"),
    listBucket("course-images"),
  ]);

  const files = [...siteAssets, ...courseImages];

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <h1 className="wp-page-title">মিডিয়া লাইব্রেরি</h1>
      <p className="wp-subtitle">আপলোড করা ছবি ও ফাইল ম্যানেজ করুন</p>

      <div className="wp-panel">
        <div className="wp-panel-header">
          সব ফাইল
          <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
            {files.length}
          </span>
        </div>
        {files.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="overflow-hidden rounded border border-[#c3c4c7] bg-white"
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-[#f0f0f1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-[#1d2327]">
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#646970]">
                    {file.bucket} · {formatSize(file.size)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="wp-btn flex-1"
                    >
                      <i className="fa-solid fa-eye" /> দেখুন
                    </a>
                    <MediaDeleteButton bucket={file.bucket} path={file.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-[#646970]">
            এখনো কোনো ফাইল নেই। কোর্স কভার বা লোগো আপলোড করলে এখানে দেখা যাবে।
          </p>
        )}
      </div>
    </div>
  );
}