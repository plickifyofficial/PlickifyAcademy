import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { signOut } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "instructor")
    redirect("/dashboard");

  const isInstructor = profile?.role === "instructor";
  const siteName = "Plickify Academy";
  const adminName = profile?.full_name || user.email;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f0f1]">
      <AdminSidebar isInstructor={isInstructor} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-black/10 bg-[#1d2327] px-4">
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

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}