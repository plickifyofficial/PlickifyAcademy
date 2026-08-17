import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/components/layout/site-nav";
import { UserMenu } from "@/components/layout/user-menu";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_name, logo_url")
    .eq("id", 1)
    .single();

  const siteName = settings?.site_name || "Plickify Academy";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt={siteName}
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-md shadow-brand-500/30">
                <i className="fa-solid fa-graduation-cap text-white" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold tracking-tight text-zinc-900">
                  Plickify
                </span>
                <span className="-mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-600">
                  Academy
                </span>
              </span>
            </>
          )}
        </Link>

        <SiteNav />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/courses"
            aria-label="সার্চ"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand-600 md:flex"
          >
            <i className="fa-solid fa-magnifying-glass" />
          </Link>

          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}