"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function SiteNav({ links }: { links: { label: string; href: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <nav className="hidden items-center gap-7 lg:flex">
        {links.map((link) => (
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
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 lg:hidden"
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-xl`} />
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              id="mobile-nav-drawer"
              aria-hidden={!open}
              className={cn(
                "fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out lg:hidden",
                open ? "translate-x-0" : "translate-x-full",
              )}
            >
        <div className="safe-top flex h-16 shrink-0 items-center justify-between border-b border-zinc-100 px-5">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800">
              <i className="fa-solid fa-graduation-cap text-white" />
            </span>
            <span className="text-sm font-extrabold text-zinc-900">
              Plickify Academy
            </span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                isActive(link.href)
                  ? "bg-brand-50 font-semibold text-brand-600"
                  : "text-zinc-700 hover:bg-zinc-50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="safe-bottom shrink-0 border-t border-zinc-100 px-4 py-4">
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700"
            >
              My Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[49] bg-black/50 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
          </>,
          document.body,
        )}
    </>
  );
}