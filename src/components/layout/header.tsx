import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/layout/user-menu";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            P
          </span>
          <span className="text-lg font-bold text-zinc-900">
            Plickify <span className="text-indigo-600">Academy</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
          <Link href="/courses" className="hover:text-indigo-600">
            কোর্সসমূহ
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-600">
            আমার ড্যাশবোর্ড
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-indigo-600"
              >
                লগইন
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
