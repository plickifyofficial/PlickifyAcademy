"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAvatar, removeAvatar } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/toaster";

export function AvatarUpload({
  initialUrl,
  name,
}: {
  initialUrl: string;
  name: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadAvatar(fd);
    setPending(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    if (result?.url) setUrl(result.url);
    showToast("Profile picture updated");
    router.refresh();
  }

  async function handleRemove() {
    setPending(true);
    const result = await removeAvatar();
    setPending(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    setUrl("");
    showToast("Profile picture removed");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-brand-700">
            {(name || "S").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Change Photo"}
        </button>
        {url && (
          <button
            type="button"
            disabled={pending}
            onClick={handleRemove}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Remove photo
          </button>
        )}
        <p className="text-xs text-zinc-400">PNG, JPG or WEBP under 2MB</p>
      </div>
    </div>
  );
}
