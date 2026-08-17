"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <>
      <nav className="hidden items-center gap-7 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-brand-600",
              isActive(link.href) ? "text-brand-600" : "text-zinc-700",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="মেনু"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-lg`} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-[72px] border-b border-zinc-100 bg-white shadow-lg lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-brand-50 text-brand-600"
                    : "text-zinc-700 hover:bg-zinc-50",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white lg:hidden"
            >
              কোর্স দেখুন
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}