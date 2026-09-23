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
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) redirect("/login");

  // sites.bd flow: no server DB — instant shell
  const siteName = "Plickify Academy";
  const adminName = user.email;
  const isInstructor = false;

  return (
    <div className="flex min-h-screen bg-[#f0f0f1]">
      <AdminSidebar isInstructor={isInstructor} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-black/10 bg-[#1d2327] px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-zinc-800">
              P
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
              <i className="fa-solid fa-globe mr-1" /> View Site
            </Link>
            <form action={signOut}>
              <button
                className="rounded border border-white/20 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-white/10"
                aria-label="Logout"
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