import type { WhyContent } from "@/lib/content-schema";

export function WhyUs({ content }: { content: WhyContent }) {
  return (
    <section id="why" className="bg-zinc-50/70 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {content.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            {content.title}
          </h2>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {content.items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-xl text-white shadow-md shadow-brand-600/25">
                <i className={item.icon} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
