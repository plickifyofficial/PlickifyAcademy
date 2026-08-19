"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const menu = [
  {
    group: "Dashboard",
    items: [{ href: "/admin", label: "Dashboard", icon: "fa-solid fa-gauge" }],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/home", label: "Home Page", icon: "fa-solid fa-house" },
      { href: "/admin/pages", label: "Pages", icon: "fa-solid fa-file-lines" },
      { href: "/admin/courses", label: "Courses", icon: "fa-solid fa-book-open" },
      { href: "/admin/courses?add=1", label: "New Course", icon: "fa-solid fa-file-circle-plus" },
      { href: "/admin/assignments", label: "Assignments", icon: "fa-solid fa-clipboard-check" },
      { href: "/admin/batches", label: "Live Batches", icon: "fa-solid fa-calendar-days" },
      { href: "/admin/instructors", label: "Instructors", icon: "fa-solid fa-chalkboard-user" },
      { href: "/admin/categories", label: "Categories", icon: "fa-solid fa-folder" },
      { href: "/admin/faqs", label: "FAQs", icon: "fa-solid fa-circle-question" },
      { href: "/admin/testimonials", label: "Testimonials", icon: "fa-solid fa-quote-right" },
      { href: "/admin/blog", label: "Blog", icon: "fa-solid fa-blog" },
      { href: "/admin/newsletter", label: "Newsletter", icon: "fa-solid fa-envelope-open-text" },
    ],
  },
  {
    group: "Users",
    items: [{ href: "/admin/students", label: "Students", icon: "fa-solid fa-users" }],
  },
  {
    group: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "fa-solid fa-cart-shopping" },
      { href: "/admin/products", label: "Products", icon: "fa-solid fa-cube" },
      { href: "/admin/enrollments", label: "Enrollments", icon: "fa-solid fa-user-plus" },
      { href: "/admin/coupons", label: "Coupons", icon: "fa-solid fa-ticket" },
    ],
  },
  {
    group: "Support",
    items: [
      { href: "/admin/messages", label: "Messages", icon: "fa-solid fa-comment-dots" },
      { href: "/admin/contact", label: "Contact Messages", icon: "fa-solid fa-envelope" },
    ],
  },
  {
    group: "Media",
    items: [{ href: "/admin/media", label: "Media Library", icon: "fa-solid fa-images" }],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/settings", label: "Site Settings", icon: "fa-solid fa-sliders" },
      { href: "/admin/system", label: "System Status", icon: "fa-solid fa-gauge-high" },
    ],
  },
];

const instructorMenu = [
  {
    group: "Content",
    items: [
      { href: "/admin/courses", label: "My Courses", icon: "fa-solid fa-book-open" },
      { href: "/admin/courses?add=1", label: "New Course", icon: "fa-solid fa-file-circle-plus" },
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
        aria-label="Menu"
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
            aria-label="Close"
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

          <p className="wp-menu-group-title">My</p>
          <Link href="/" className="wp-menu-item">
            <i className="fa-solid fa-globe w-5 text-center" /> View Site
          </Link>
          <button onClick={handleSignOut} className="wp-menu-item w-full text-left">
            <i className="fa-solid fa-right-from-bracket w-5 text-center" /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}