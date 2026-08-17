import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <main className="mx-auto flex max-w-6xl flex-1 gap-8 px-4 py-10">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-20 space-y-1">
          <p className="mb-3 text-sm font-medium text-zinc-400">
            {profile?.full_name || user.email}
          </p>
          <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            📚 আমার কোর্স
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              🛠️ অ্যাডমিন প্যানেল
            </Link>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </main>
  );
}
