"use client";

import { useEffect, useState } from "react";
import type { MarkdownHeading } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function Toc({ headings }: { headings: MarkdownHeading[] }) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;
    function onScroll() {
      let current = "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 90) {
          current = h.id;
        }
      }
      setActive(current || headings[0]?.id || "");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  function go(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollBy({ top: -90 });
      setOpen(false);
    }
  }

  return (
    <nav
      className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-24"
      aria-label="Table of contents"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-zinc-900">
          <i className="fa-solid fa-list text-brand-600" /> Table of Contents
        </span>
        <i
          className={cn(
            "fa-solid fa-chevron-down text-xs text-zinc-400 transition-transform lg:hidden",
            open && "rotate-180",
          )}
        />
      </button>
      <ul
        className={cn(
          "mt-3 space-y-1 border-t border-zinc-100 pt-3",
          open ? "block" : "hidden lg:block",
        )}
      >
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: (h.level - 2) * 12 }}>
            <button
              type="button"
              onClick={() => go(h.id)}
              className={cn(
                "w-full rounded-lg px-2 py-1.5 text-left text-sm leading-snug transition-colors",
                active === h.id
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-brand-700",
              )}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}