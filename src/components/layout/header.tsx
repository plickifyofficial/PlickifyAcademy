"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { AuthSection } from "@/components/layout/auth-section";
import { SearchModal } from "@/components/layout/search-modal";
import { cn } from "@/lib/utils";

type Settings = {
  site_name: string;
  logo_url: string | null;
};

export function Header({
  settings,
  nav,
}: {
  settings: Settings | null;
  nav: { label: string; href: string }[];
}) {
  const siteName = settings?.site_name || "Plickify Academy";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-all duration-200",
        scrolled
          ? "border-zinc-200 shadow-sm"
          : "border-zinc-100 shadow-none",
      )}
    >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-200 sm:px-6",
            scrolled ? "h-16 lg:h-[76px]" : "h-[72px] lg:h-20",
          )}
        >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt={siteName}
              className="h-8 w-auto max-w-[150px] object-contain sm:h-9 sm:max-w-[180px]"
            />
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-md shadow-brand-500/30 sm:h-9 sm:w-9">
                <i className="fa-solid fa-graduation-cap text-white" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight text-zinc-900 sm:text-lg">
                  Plickify
                </span>
                <span className="-mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-600 sm:text-[11px]">
                  Academy
                </span>
              </span>
            </>
          )}
        </Link>

        <SiteNav links={nav} />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SearchModal />
          <AuthSection />
        </div>
      </div>
    </header>
  );
}