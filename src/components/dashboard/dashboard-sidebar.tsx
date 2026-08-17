"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: "fa-solid fa-chart-line" },
  { href: "/dashboard/courses", label: "আমার কোর্স", icon: "fa-solid fa-graduation-cap" },
  { href: "/dashboard/wishlist", label: "পছন্দের তালিকা", icon: "fa-solid fa-heart" },
  { href: "/dashboard/profile", label: "প্রোফাইল", icon: "fa-solid fa-user" },
];

export function DashboardSidebar({
  name,
  email,
  isAdmin,
  isInstructor,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  isInstructor: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = [
    ...navItems,
    ...(isInstructor
      ? [{ href: "/admin/courses", label: "আমার কোর্স (ইনস্ট্রাক্টর)", icon: "fa-solid fa-chalkboard-user" }]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "অ্যাডমিন", icon: "fa-solid fa-toolbox" }] : []),
  ];

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-[72px] z-40 rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 shadow-sm md:hidden"
        aria-label="মেনু"
      >
        <i className="fa-solid fa-bars" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-zinc-200 bg-white transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:transform-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="border-b border-zinc-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {name}
                </p>
                <p className="truncate text-xs text-zinc-500">{email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-600 text-white"
                      : "text-zinc-600 hover:bg-zinc-100",
                  )}
                >
                  <span className="text-base"><i className={item.icon} /></span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-zinc-100 p-3">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <span><i className="fa-solid fa-right-from-bracket" /></span> লগআউট
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}