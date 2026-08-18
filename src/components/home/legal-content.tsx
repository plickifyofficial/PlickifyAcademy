import type { LegalPageContent } from "@/lib/content-schema";

export function LegalContent({ content }: { content: LegalPageContent }) {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      {content.updated && (
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {content.updated}
        </p>
      )}

      <div className="space-y-6">
        {(content.sections ?? []).map((s) => (
          <div
            key={s.heading}
            className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
            data-aos="fade-up"
          >
            <h2 className="flex items-center gap-3 text-lg font-bold text-zinc-900">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <i className="fa-solid fa-circle-info text-sm" />
              </span>
              {s.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}