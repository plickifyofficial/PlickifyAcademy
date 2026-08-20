"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";

type Group = { title: string; items: { href: string; label: string; icon: string }[] };

const GROUPS: Group[] = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "fa-solid fa-gauge-high" },
      { href: "/dashboard/courses", label: "My Courses", icon: "fa-solid fa-graduation-cap" },
    ],
  },
  {
    title: "Learning",
    items: [
      { href: "/dashboard/live-classes", label: "Live Classes", icon: "fa-solid fa-video" },
      { href: "/dashboard/quizzes", label: "Quizzes", icon: "fa-solid fa-circle-question" },
      { href: "/dashboard/assignments", label: "Assignments", icon: "fa-solid fa-clipboard-check" },
      { href: "/dashboard/certificates", label: "Certificates", icon: "fa-solid fa-award" },
    ],
  },
  {
    title: "My Store",
    items: [
      { href: "/dashboard/my-products", label: "Digital Products", icon: "fa-solid fa-box-open" },
      { href: "/dashboard/downloads", label: "Downloads", icon: "fa-solid fa-download" },
      { href: "/dashboard/orders", label: "Orders", icon: "fa-solid fa-receipt" },
      { href: "/dashboard/wishlist", label: "Wishlist", icon: "fa-solid fa-heart" },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/dashboard/messages", label: "Messages", icon: "fa-solid fa-comment-dots" },
      { href: "/dashboard/notifications", label: "Notifications", icon: "fa-solid fa-bell" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: "fa-solid fa-user" },
      { href: "/dashboard/settings", label: "Settings", icon: "fa-solid fa-gear" },
    ],
  },
];

export function StudentShell({
  name,
  email,
  avatarUrl,
  role,
  siteName,
  logoUrl,
  children,
}: {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  siteName: string;
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerState, setDrawerState] = useState<{
    open: boolean;
    atPath: string;
  }>({ open: false, atPath: pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [menuState, setMenuState] = useState<{
    open: boolean;
    atPath: string;
  }>({ open: false, atPath: pathname });

  const drawerOpen = drawerState.open && drawerState.atPath === pathname;
  const menuOpen = menuState.open && menuState.atPath === pathname;

  function toggleCollapse() {
    setCollapsed((v) => !v);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const initials = (name || "S").charAt(0).toUpperCase();
  const staffItems: Group[] = [];
  if (role === "instructor") {
    staffItems.push({
      title: "Staff",
      items: [{ href: "/admin/courses", label: "Instructor", icon: "fa-solid fa-chalkboard-user" }],
    });
  }
  if (role === "admin") {
    staffItems.push({
      title: "Staff",
      items: [{ href: "/admin", label: "Admin Panel", icon: "fa-solid fa-toolbox" }],
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerState({ open: true, atPath: pathname })}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100 md:hidden"
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <button
            onClick={toggleCollapse}
            className="hidden h-11 w-11 items-center justify-center rounded-lg border border-zinc-300 text-sm font-bold text-zinc-500 hover:bg-zinc-100 md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <i className="fa-solid fa-angle-right" />
            ) : (
              <i className="fa-solid fa-angle-left" />
            )}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={siteName}
                className="h-7 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800 text-white">
                <i className="fa-solid fa-graduation-cap text-sm" />
              </span>
            )}
          </Link>
        </div>

        <form
          action="/dashboard/search"
          className="mx-auto hidden w-full max-w-md flex-1 sm:block"
        >
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400" />
            <input
              type="search"
              name="q"
              placeholder="কোর্স, lesson বা resource খুঁজুন..."
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
          <form
            action="/dashboard/search"
            className="sm:hidden"
          >
            <button
              type="submit"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
              aria-label="Search"
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
          </form>
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() =>
                setMenuState((v) =>
                  v.open && v.atPath === pathname
                    ? { open: false, atPath: pathname }
                    : { open: true, atPath: pathname },
                )
              }
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-brand-100 text-sm font-bold text-brand-700 hover:ring-2 hover:ring-brand-100"
              aria-label="Account menu"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuState({ open: false, atPath: pathname })} />
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
                  <div className="border-b border-zinc-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-zinc-900">{name}</p>
                    <p className="truncate text-xs text-zinc-500">{email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <i className="fa-solid fa-user w-4 text-center text-zinc-400" /> Profile
                    </Link>
                    <Link
                      href="/dashboard/courses"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <i className="fa-solid fa-graduation-cap w-4 text-center text-zinc-400" /> My Courses
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <i className="fa-solid fa-globe w-4 text-center text-zinc-400" /> View Site
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4 text-center" /> Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white transition-all md:sticky md:top-16 md:z-30 md:h-[calc(100vh-4rem)]",
            collapsed && "md:w-[76px]",
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col">
            <div className={cn("border-b border-zinc-100", collapsed ? "p-3" : "p-4")}>
              {collapsed ? (
                <div className="flex justify-center">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-base font-bold text-brand-700">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">{name}</p>
                    <p className="truncate text-xs text-zinc-500">{email}</p>
                    <span className="mt-0.5 inline-block rounded-full bg-brand-50 px-1.5 py-px text-[10px] font-semibold capitalize text-brand-700">
                      {role}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto p-3">
              {[...GROUPS, ...staffItems].map((group) => (
                <div key={group.title}>
                  {!collapsed && (
                    <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {group.title}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            collapsed && "justify-center px-0",
                            active
                              ? "bg-brand-600 text-white"
                              : "text-zinc-600 hover:bg-zinc-100",
                          )}
                        >
                          <i className={cn(item.icon, "w-5 text-center", !collapsed && "text-base")} />
                          {!collapsed && item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-zinc-100 p-3">
              <button
                onClick={handleSignOut}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50",
                  collapsed && "w-full justify-center px-0",
                )}
              >
                <i className="fa-solid fa-right-from-bracket w-5 text-center" />
                {!collapsed && "Log Out"}
              </button>
            </div>
          </div>
        </aside>

        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setDrawerState({ open: false, atPath: pathname })}
          />
        )}

        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Primary"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden"
        data-floating-obstacle
      >
        {(
          [
            { href: "/dashboard", label: "Home", icon: "fa-solid fa-house" },
            { href: "/dashboard/courses", label: "Courses", icon: "fa-solid fa-graduation-cap" },
            { href: "/dashboard/live-classes", label: "Live", icon: "fa-solid fa-video" },
            { href: "/dashboard/notifications", label: "Bell", icon: "fa-solid fa-bell" },
            { href: "/dashboard/profile", label: "Me", icon: "fa-solid fa-user" },
          ] as const
        ).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                active ? "text-brand-600" : "text-zinc-500",
              )}
            >
              <i className={`${item.icon} text-lg`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}