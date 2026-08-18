import Link from "next/link";
import type { FooterContent } from "@/lib/content-schema";

type Settings = {
  site_name: string;
  logo_url: string | null;
};

export function Footer({
  settings,
  content,
}: {
  settings: Settings | null;
  content: FooterContent;
}) {
  const siteName = settings?.site_name || "Plickify Academy";

  return (
    <footer id="contact" className="bg-brand-900 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {settings?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logo_url}
                  alt={siteName}
                  className="h-9 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800">
                    <i className="fa-solid fa-graduation-cap text-white" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-lg font-extrabold text-white">
                      Plickify
                    </span>
                    <span className="-mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-300">
                      Academy
                    </span>
                  </span>
                </>
              )}
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
              {content.about}
            </p>
            <div className="mt-6 flex gap-3">
              {content.socials.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  aria-label="সোশ্যাল লিংক"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <i className={`${s.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {content.quickLinksTitle}
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {content.quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-zinc-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {content.supportTitle}
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {content.supportLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-zinc-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              <li>
                <a href={`mailto:${content.email}`} className="flex items-center gap-2.5 hover:text-white">
                  <i className="fa-solid fa-envelope text-brand-400" />
                  {content.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fa-solid fa-phone text-brand-400" />
                {content.phone}
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fa-solid fa-location-dot text-brand-400" />
                {content.address}
              </li>
            </ul>

            <form className="mt-6" action="/" aria-label="নিউজলেটার">
              <p className="text-sm font-semibold text-white">
                {content.newsletterTitle}
              </p>
              <div className="mt-3 flex overflow-hidden rounded-full border border-white/15 bg-white/5">
                <input
                  type="email"
                  required
                  placeholder={content.newsletterPlaceholder}
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
                >
                  {content.newsletterButton}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">{content.copyright}</p>
          <div className="flex items-center gap-2 text-zinc-500">
            {content.paymentBadges.map((b) => (
              <span
                key={b}
                className="flex h-7 w-10 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-bold text-zinc-400"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
