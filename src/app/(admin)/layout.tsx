import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOut } from "@/lib/actions/auth";

export default async function AdminLayout({
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

  if (profile?.role !== "admin" && profile?.role !== "instructor")
    redirect("/dashboard");

  const isInstructor = profile?.role === "instructor";

  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_name, logo_url")
    .eq("id", 1)
    .single();

  const siteName = settings?.site_name || "Plickify Academy";
  const adminName = profile?.full_name || user.email;

  return (
    <div className="flex min-h-screen bg-[#f0f0f1]">
      <AdminSidebar isInstructor={isInstructor} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-black/10 bg-[#1d2327] px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-800">
              {settings?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logo_url}
                  alt={siteName}
                  className="h-7 w-7 rounded-full object-contain"
                />
              ) : (
                "P"
              )}
            </span>
            <Link href="/admin" className="text-sm font-semibold text-white hover:text-zinc-300">
              {siteName}
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-200 sm:inline">
              <i className="fa-solid fa-shield-halved mr-1.5 text-[10px]" />
              {isInstructor ? "Instructor" : "Admin"}
            </span>
            <span className="hidden text-xs font-medium text-zinc-300 md:inline">
              {adminName}
            </span>
            <Link
              href="/"
              className="rounded border border-white/20 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-white/10"
            >
              <i className="fa-solid fa-globe mr-1" /> সাইট দেখুন
            </Link>
            <form action={signOut}>
              <button
                className="rounded border border-white/20 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-white/10"
                aria-label="লগআউট"
              >
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </form>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}