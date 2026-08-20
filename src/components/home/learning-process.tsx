import type { ProcessContent } from "@/lib/content-schema";

export function LearningProcess({ content }: { content: ProcessContent }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="text-center" data-aos="fade-up">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
          {content.eyebrow}
        </span>
        <h2 className="mt-3 section-heading font-extrabold text-zinc-900">
          {content.title}
        </h2>
      </div>

      <div className="relative mt-14" data-aos="fade-up" data-aos-delay="100">
        <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-brand-100 lg:block" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {content.steps.map((step, i) => (
            <div key={`${step.title}-${i}`} className="relative flex flex-col items-center text-center lg:items-center">
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-2xl text-white shadow-lg shadow-brand-600/30 ring-8 ring-white">
                <i className={step.icon} />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-amber-950">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <h3 className="mt-4 text-base font-bold text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-1 max-w-[180px] text-sm text-zinc-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
