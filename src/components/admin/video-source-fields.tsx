"use client";

import { useState } from "react";
import {
  detectProvider,
  providerHint,
  type VideoProvider,
} from "@/lib/video";

const PROVIDERS: { value: VideoProvider; label: string; icon: string }[] = [
  { value: "none", label: "কোনো ভিডিও নেই", icon: "fa-solid fa-ban" },
  { value: "youtube", label: "YouTube লিংক", icon: "fa-brands fa-youtube" },
  { value: "drive", label: "Google Drive", icon: "fa-brands fa-google-drive" },
  { value: "vimeo", label: "Vimeo", icon: "fa-brands fa-vimeo" },
  { value: "direct", label: "সরাসরি ফাইল URL", icon: "fa-solid fa-file-video" },
  { value: "embed", label: "Embed কোড", icon: "fa-solid fa-code" },
];

export function VideoSourceFields({
  prefix,
  initialUrl = "",
  initialEmbed = "",
  className = "",
}: {
  prefix: string;
  initialUrl?: string;
  initialEmbed?: string;
  className?: string;
}) {
  const initialType: VideoProvider = initialEmbed?.trim()
    ? "embed"
    : detectProvider(initialUrl ?? "");
  const [type, setType] = useState<VideoProvider>(initialType);

  return (
    <div className={className}>
      <label className="wp-label">ভিডিও সোর্স</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as VideoProvider)}
        className="wp-input"
      >
        {PROVIDERS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {type !== "none" && (
        <div className="mt-2 space-y-2">
          {type === "embed" ? (
            <div>
              <label className="wp-label">Embed কোড</label>
              <textarea
                name={`${prefix}_embed`}
                defaultValue={initialEmbed}
                rows={3}
                className="wp-input"
                placeholder='<iframe src="https://drive.google.com/file/d/XXXX/preview" width="560" height="315" allowfullscreen></iframe>'
              />
              <p className="mt-1 text-xs text-[#646970]">{providerHint("embed")}</p>
            </div>
          ) : (
            <div>
              <label className="wp-label">ভিডিও লিংক</label>
              <input
                name={`${prefix}_url`}
                defaultValue={initialUrl}
                placeholder="https://..."
                className="wp-input"
              />
              <p className="mt-1 text-xs text-[#646970]">{providerHint(type)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}