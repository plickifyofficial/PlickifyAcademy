"use client";

import { useState } from "react";
import { saveMediaMeta } from "@/lib/actions/media";

type Props = {
  bucket: string;
  path: string;
  initial: { display_name: string; alt_text: string; caption: string };
};

export function MediaMetaButton({ bucket, path, initial }: Props) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [altText, setAltText] = useState(initial.alt_text);
  const [caption, setCaption] = useState(initial.caption);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setPending(true);
    setSaved(false);
    try {
      await saveMediaMeta(bucket, path, {
        displayName,
        altText,
        caption,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="wp-btn flex-1"
        title="Edit name, alt text and caption"
      >
        <i className="fa-solid fa-pen" /> Details
      </button>
    );
  }

  return (
    <div className="mt-2 w-full space-y-2 rounded border border-[#c3c4c7] bg-[#f6f7f7] p-3">
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#646970]">
          Display Name
        </span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Friendly name"
          className="wp-input !min-h-8 !text-xs"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#646970]">
          Alt Text
        </span>
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image (accessibility + SEO)"
          className="wp-input !min-h-8 !text-xs"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[#646970]">
          Caption
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Optional caption"
          rows={2}
          className="wp-input !text-xs"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="wp-btn wp-btn-primary !min-h-8 !text-xs"
        >
          <i className={pending ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-check"} />
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="wp-btn !min-h-8 !text-xs"
        >
          Close
        </button>
        {saved && (
          <span className="text-xs font-semibold text-emerald-600">Saved!</span>
        )}
      </div>
    </div>
  );
}
