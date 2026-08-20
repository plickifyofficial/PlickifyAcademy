"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function FooterColumn({
  title,
  links,
  defaultOpen = true,
}: {
  title: string;
  links: { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 py-1 last:border-b-0 md:border-0 md:py-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-bold uppercase tracking-wider text-white md:cursor-default md:py-0 md:pointer-events-none"
      >
        <span className="pointer-events-none">{title}</span>
        <i
          className={cn(
            "fa-solid fa-chevron-down text-xs text-zinc-400 transition-transform duration-200 md:hidden",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 md:grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="space-y-3 pb-4 text-sm md:mt-5 md:pb-0">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="flex min-h-8 items-center text-zinc-400 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}