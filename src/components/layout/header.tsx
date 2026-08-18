import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { AuthSection } from "@/components/layout/auth-section";

type Settings = {
  site_name: string;
  logo_url: string | null;
};

export function Header({
  settings,
  nav,
}: {
  settings: Settings | null;
  nav: { label: string; href: string }[];
}) {
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

        <SiteNav links={nav} />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/courses"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand-600 md:flex"
          >
            <i className="fa-solid fa-magnifying-glass" />
          </Link>

          <AuthSection />
        </div>
      </div>
    </header>
  );
}
