"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listMedia,
  deleteMedia,
  uploadMedia,
  type MediaFile,
} from "@/lib/actions/media";
import { useToast } from "@/components/ui/toaster";

function formatBytes(n: number) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const { showToast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await listMedia());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load media", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await uploadMedia(fd);
      showToast("Uploaded to library");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(f: MediaFile) {
    if (!confirm(`Delete ${f.name}?`)) return;
    try {
      const fd = new FormData();
      fd.append("bucket", f.bucket);
      fd.append("path", f.name);
      await deleteMedia(fd);
      showToast("Deleted");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  function handleCopy(f: MediaFile) {
    void navigator.clipboard?.writeText(f.url).then(() => showToast("URL copied"));
  }

  const filtered = query.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : files;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e2e2e2] px-5 py-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#1d2327]">
            <i className="fa-solid fa-images text-[#2271b1]" /> Media Library
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#646970] hover:bg-[#f0f0f1]"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e2e2] px-5 py-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#2271b1] px-3 py-2 text-xs font-semibold text-white hover:bg-[#135e96]">
            <i className="fa-solid fa-upload" />
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="wp-input min-w-0 flex-1"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#646970]">
              <i className="fa-solid fa-spinner fa-spin mr-2" /> Loading media...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <i className="fa-solid fa-folder-open text-3xl text-[#c3c4c7]" />
              <p className="mt-2 text-sm text-[#646970]">
                {query ? "No files match your search." : "No media yet. Upload your first image."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((f) => (
                <div
                  key={`${f.bucket}/${f.name}`}
                  className="group relative overflow-hidden rounded-xl border border-[#e2e2e2] bg-[#f0f0f1]"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(f.url)}
                    className="block aspect-video w-full cursor-pointer overflow-hidden bg-white"
                    title="Insert"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.url}
                      alt={f.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                  <div className="truncate px-2 py-1.5 text-[11px] text-[#3c434a]">{f.name}</div>
                  <div className="px-2 pb-1.5 text-[10px] text-[#646970]">
                    {formatBytes(f.size)}
                  </div>
                  <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleCopy(f)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#2271b1] shadow"
                      title="Copy URL"
                    >
                      <i className="fa-solid fa-link" />
                    </button>
                    <button
                      onClick={() => void handleDelete(f)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-red-500 shadow"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
