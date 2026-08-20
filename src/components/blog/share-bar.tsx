"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toaster";

const SHARES = [
  {
    key: "facebook",
    label: "Facebook",
    icon: "fa-brands fa-facebook-f",
    bg: "bg-[#1877f2]",
  },
  {
    key: "messenger",
    label: "Messenger",
    icon: "fa-brands fa-facebook-messenger",
    bg: "bg-[#0099ff]",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "fa-brands fa-whatsapp",
    bg: "bg-[#25d366]",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    bg: "bg-[#0a66c2]",
  },
  {
    key: "x",
    label: "X",
    icon: "fa-brands fa-x-twitter",
    bg: "bg-zinc-900",
  },
];

export function ShareBar({ title }: { title: string }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function share(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  function buildShare(key: string) {
    const u = encodeURIComponent(window.location.href);
    const t = encodeURIComponent(title);
    switch (key) {
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
      case "messenger":
        return `https://www.facebook.com/dialog/send?link=${u}&app_id=291494419107518&redirect_uri=${u}`;
      case "whatsapp":
        return `https://wa.me/?text=${t}%20${u}`;
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
      case "x":
        return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
      default:
        return u;
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy link", "error");
    }
  }

  return (
    <>
      {/* Desktop sticky side bar */}
      <div className="absolute -left-16 top-0 hidden flex-col items-center gap-2 xl:flex">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Share
        </span>
        {SHARES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => share(buildShare(s.key))}
            aria-label={s.label}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${s.bg} text-white shadow-md transition-transform hover:scale-110`}
          >
            <i className={s.icon} />
          </button>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-md transition-transform hover:scale-110"
        >
          {copied ? (
            <i className="fa-solid fa-check text-green-600" />
          ) : (
            <i className="fa-solid fa-link" />
          )}
        </button>
      </div>

      {/* Mobile / inline row */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-6 xl:hidden">
        <span className="mr-1 text-sm font-semibold text-zinc-600">Share:</span>
        {SHARES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => share(buildShare(s.key))}
            aria-label={s.label}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${s.bg} text-white shadow-sm transition-transform hover:scale-110`}
          >
            <i className={s.icon} />
          </button>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-transform hover:scale-110"
        >
          {copied ? (
            <i className="fa-solid fa-check text-green-600" />
          ) : (
            <i className="fa-solid fa-link" />
          )}
        </button>
      </div>
    </>
  );
}