"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProseContent } from "@/components/editor/prose-content";

export type PopupContentClient = {
  is_enabled: boolean;
  title: string;
  body: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  delaySeconds: number;
  showOncePerSession: boolean;
};

const SESSION_KEY = "plickify_popup_dismissed";

export function PopupBanner({ content }: { content: PopupContentClient }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!content.is_enabled) return;
    if (
      content.showOncePerSession &&
      sessionStorage.getItem(SESSION_KEY) === "1"
    )
      return;

    const delay = Math.max(0, (content.delaySeconds || 5) * 1000);
    const timer = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(timer);
  }, [content]);

  function dismiss() {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // private mode — ignore
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Close popup"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow transition-colors hover:bg-zinc-100"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {content.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.image}
            alt={content.title}
            className="max-h-48 w-full object-cover"
          />
        ) : null}

        <div className="p-6">
          <h2 className="text-xl font-extrabold text-zinc-900">
            {content.title}
          </h2>
          {content.body ? (
            <div className="prose-content mt-3 max-w-none text-sm">
              <ProseContent html={content.body} />
            </div>
          ) : null}

          {content.buttonText && content.buttonLink ? (
            <Link
              href={content.buttonLink}
              onClick={dismiss}
              className="mt-5 flex min-h-11 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700"
            >
              {content.buttonText}
              <i className="fa-solid fa-arrow-right ml-2 text-xs" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
