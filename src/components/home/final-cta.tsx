import Link from "next/link";
import type { CtaContent } from "@/lib/content-schema";

export function FinalCta({ content }: { content: CtaContent }) {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-[2rem] bg-brand-900 px-8 py-14 shadow-2xl shadow-brand-900/40 sm:px-14"
          data-aos="zoom-in"
        >
          <span className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
          <span className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[auto_1fr_auto]">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 shadow-lg shadow-brand-500/40 lg:mx-0">
              <i className={`${content.icon || "fa-brands fa-telegram"} text-4xl text-white`} />
            </span>

            <div className="text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                {content.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                {content.title}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-300 lg:mx-0">
                {content.subtitle}
              </p>
            </div>

            <Link
              href={content.buttonLink || "/signup"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-9 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/40 transition-all hover:-translate-y-0.5 hover:bg-brand-500"
            >
              {content.buttonText}
              <i className="fa-solid fa-arrow-right text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
