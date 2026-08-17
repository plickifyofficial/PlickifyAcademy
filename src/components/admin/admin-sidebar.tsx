"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const menu = [
  { section: "মেইন", items: [
    { href: "/admin", label: "ড্যাশবোর্ড", icon: "fa-solid fa-chart-line" },
  ]},
  { section: "কনটেন্ট", items: [
    { href: "/admin/courses", label: "কোর্সসমূহ", icon: "fa-solid fa-graduation-cap" },
  ]},
  { section: "ব্যবহারকারী", items: [
    { href: "/admin/students", label: "স্টুডেন্টস", icon: "fa-solid fa-users" },
  ]},
  { section: "সেলস", items: [
    { href: "/admin/orders", label: "অর্ডারসমূহ", icon: "fa-solid fa-sack-dollar" },
  ]},
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-20 z-50 rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-200 md:hidden"
        aria-label="মেনু"
      >
        <i className="fa-solid fa-bars" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 transform bg-zinc-900 text-zinc-300 transition-transform md:sticky md:top-0 md:h-screen md:transform-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-zinc-800 p-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                P
              </span>
              <span className="text-sm font-bold text-white">
                Plickify <span className="text-indigo-400">Admin</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            {menu.map((group) => (
              <div key={group.section} className="mb-5">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {group.section}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/admin" &&
                        pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-indigo-600 text-white"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                        )}
                      >
                        <span className="w-4"><i className={item.icon} /></span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-zinc-800 p-3">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-400 hover:bg-zinc-800"
            >
              <span><i className="fa-solid fa-right-from-bracket" /></span> লগআউট
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}