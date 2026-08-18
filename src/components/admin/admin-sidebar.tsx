"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const menu = [
  {
    group: "Dashboard",
    items: [{ href: "/admin", label: "ড্যাশবোর্ড", icon: "fa-solid fa-gauge" }],
  },
  {
    group: "কনটেন্ট",
    items: [
      { href: "/admin/home", label: "হোম পেজ", icon: "fa-solid fa-house" },
      { href: "/admin/courses", label: "কোর্সসমূহ", icon: "fa-solid fa-book-open" },
      { href: "/admin/courses?add=1", label: "নতুন কোর্স", icon: "fa-solid fa-file-circle-plus" },
    ],
  },
  {
    group: "ব্যবহারকারী",
    items: [{ href: "/admin/students", label: "স্টুডেন্টস", icon: "fa-solid fa-users" }],
  },
  {
    group: "সেলস",
    items: [
      { href: "/admin/orders", label: "অর্ডারসমূহ", icon: "fa-solid fa-cart-shopping" },
      { href: "/admin/enrollments", label: "এনরোলমেন্ট", icon: "fa-solid fa-user-plus" },
      { href: "/admin/coupons", label: "কুপনসমূহ", icon: "fa-solid fa-ticket" },
    ],
  },
  {
    group: "মিডিয়া",
    items: [{ href: "/admin/media", label: "মিডিয়া লাইব্রেরি", icon: "fa-solid fa-images" }],
  },
  {
    group: "সেটিংস",
    items: [{ href: "/admin/settings", label: "সাইট সেটিংস", icon: "fa-solid fa-sliders" }],
  },
];

const instructorMenu = [
  {
    group: "কনটেন্ট",
    items: [
      { href: "/admin/courses", label: "আমার কোর্স", icon: "fa-solid fa-book-open" },
      { href: "/admin/courses?add=1", label: "নতুন কোর্স", icon: "fa-solid fa-file-circle-plus" },
    ],
  },
];

type Props = {
  isInstructor?: boolean;
};

export function AdminSidebar({ isInstructor = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const visibleMenu = isInstructor ? instructorMenu : menu;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-2 top-[52px] z-50 rounded p-2 text-zinc-200 hover:bg-white/10 lg:hidden"
        aria-label="মেনু"
      >
        <i className="fa-solid fa-bars text-lg" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "wp-sidebar fixed inset-y-0 left-0 z-50 flex w-[200px] flex-col overflow-y-auto transition-transform lg:static lg:z-auto lg:translate-x-0 lg:overflow-visible",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-zinc-800">
            P
          </span>
          <span className="text-sm font-semibold text-white">Plickify</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="বন্ধ করুন"
            className="ml-auto text-zinc-400 hover:text-white lg:hidden"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <nav className="flex-1 pb-20 pt-1 lg:pb-4">
          {visibleMenu.map((group) => (
            <div key={group.group}>
              <p className="wp-menu-group-title">{group.group}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn("wp-menu-item", isActive(item.href.split("?")[0]) && "active")}
                >
                  <i className={`${item.icon} w-5 text-center`} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          <p className="wp-menu-group-title">আমার</p>
          <Link href="/" className="wp-menu-item">
            <i className="fa-solid fa-globe w-5 text-center" /> সাইট দেখুন
          </Link>
          <button onClick={handleSignOut} className="wp-menu-item w-full text-left">
            <i className="fa-solid fa-right-from-bracket w-5 text-center" /> লগআউট
          </button>
        </nav>
      </aside>
    </>
  );
}