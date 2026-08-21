"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/ai", label: "Overview", icon: "fa-solid fa-gauge-high" },
  { href: "/admin/ai/settings", label: "Settings", icon: "fa-solid fa-sliders" },
  { href: "/admin/ai/knowledge", label: "Knowledge Base", icon: "fa-solid fa-database" },
  { href: "/admin/ai/logs", label: "Conversation Logs", icon: "fa-solid fa-comments" },
];

export function AiAdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-5 flex flex-wrap gap-1 border-b border-zinc-200">
      {TABS.map((t) => {
        const active =
          t.href === "/admin/ai"
            ? pathname === "/admin/ai"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
            )}
          >
            <i className={`${t.icon} text-xs`} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
