import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_name, logo_url")
    .eq("id", 1)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "Student";
  const siteName = settings?.site_name || "Plickify Academy";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt={siteName}
              className="h-8 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800 text-white">
                <i className="fa-solid fa-graduation-cap text-sm" />
              </span>
              <span className="text-base font-extrabold text-zinc-900">
                Plickify
              </span>
            </>
          )}
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <Link
            href="/courses"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Courses
          </Link>
          <Link
            href="/dashboard/courses"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            My Courses
          </Link>
          <Link
            href="/dashboard/profile"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Profile
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          <Link
            href="/"
            className="hidden rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 sm:inline-block"
          >
            <i className="fa-solid fa-globe mr-1" /> View Site
          </Link>
          <span className="hidden rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 lg:inline">
            {name.split(" ")[0]}
          </span>
          <form action={signOut}>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
              aria-label="Log out"
            >
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <DashboardSidebar
          name={name}
          email={user.email ?? ""}
          isAdmin={profile?.role === "admin"}
          isInstructor={profile?.role === "instructor"}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}