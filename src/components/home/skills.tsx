import type { SkillsContent } from "@/lib/content-schema";

export function Skills({ content }: { content: SkillsContent }) {
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

      <div
        className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {content.items.map((skill) => (
          <div
            key={skill.title}
            className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <i className={skill.icon} />
            </span>
            <h3 className="mt-3 text-sm font-bold text-zinc-900">
              {skill.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              {skill.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
