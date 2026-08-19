import Link from "next/link";
import { Faq } from "@/components/home/faq";
import { getSiteContent } from "@/lib/site-content";
import { getPublishedFaqs } from "@/lib/content-modules";
import { aboutDefaults, type AboutContent } from "@/lib/content-schema";

export const metadata = {
  title: "About Us | Plickify Academy",
  description:
    "AI, Freelancing এবং Digital Skills শেখার practical learning platform। শেখার মাধ্যমে নিজের ভবিষ্যৎ তৈরি করুন।",
};

export const revalidate = 60;

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
      {children}
    </span>
  );
}

function Avatar({
  initials,
  color,
  className,
}: {
  initials: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${color} ${className ?? "h-12 w-12 text-sm"}`}
    >
      {initials}
    </div>
  );
}

export default async function AboutPage() {
  const [content, dbFaqs] = await Promise.all([
    getSiteContent("about", aboutDefaults) as Promise<AboutContent>,
    getPublishedFaqs("about"),
  ]);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div data-aos="fade-up">
            <SectionLabel>{content.heroEyebrow}</SectionLabel>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-5xl">
              {content.heroTitle}
            </h1>
            {(content.heroParagraphs ?? []).map((p) => (
              <p key={p} className="mt-4 text-base text-zinc-500 sm:text-lg">
                {p}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={content.heroPrimaryLink}
                className="rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
              >
                {content.heroPrimary}
              </Link>
              <Link
                href={content.heroSecondaryLink}
                className="rounded-full border border-zinc-200 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                {content.heroSecondary}
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div data-aos="fade-up" data-aos-delay="150">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1a3a] to-brand-900 p-6 shadow-2xl shadow-brand-900/30 sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-600/30 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-brand-300">
                    <i className="fa-solid fa-graduation-cap" />
                    LEARNING DASHBOARD
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    <i className="fa-solid fa-circle text-[6px]" />
                    Live Class
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600/80 text-sm text-white">
                      <i className="fa-solid fa-book-open" />
                    </div>
                    <p className="mt-3 text-xs text-zinc-300">AI & Productivity</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-1.5 w-4/5 rounded-full bg-brand-500" />
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-400">80% complete</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/80 text-sm text-white">
                      <i className="fa-solid fa-brain" />
                    </div>
                    <p className="mt-3 text-xs text-zinc-300">AI Tools</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-1.5 w-3/5 rounded-full bg-violet-400" />
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-400">60% complete</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/80 text-sm text-white">
                      <i className="fa-solid fa-briefcase" />
                    </div>
                    <p className="mt-3 text-xs text-zinc-300">Freelancing</p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                      <div className="h-1.5 w-2/5 rounded-full bg-emerald-400" />
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-400">40% complete</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {["RH", "NJ", "TA"].map((i, idx) => (
                          <div
                            key={i}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-bold text-white ${idx === 0 ? "bg-brand-500" : idx === 1 ? "bg-violet-500" : "bg-emerald-500"}`}
                          >
                            {i}
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Active Students
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Learning together right now
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-3 py-1 text-[11px] font-bold text-brand-300">
                      <i className="fa-solid fa-bolt" />
                      500+
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-brand-600/30 to-indigo-600/30 p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-brand-600">
                      <i className="fa-solid fa-award" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Certificate Achieved
                      </p>
                      <p className="text-[10px] text-zinc-300">
                        AI Income Mastery
                      </p>
                    </div>
                  </div>
                  <i className="fa-solid fa-circle-check text-emerald-400" />
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3">
                  {["Learn", "Practice", "Build", "Earn"].map((s, i) => (
                    <span key={s} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-300">
                        {s}
                      </span>
                      {i < 3 && (
                        <i className="fa-solid fa-arrow-right text-[10px] text-brand-500" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4">
          {(content.stats ?? []).map((s, i) => (
            <div
              key={s.label}
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              <p className="text-3xl font-extrabold text-white sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-brand-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div data-aos="fade-up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-brand-900 p-8 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-600/30 blur-2xl" />
              <p className="text-lg font-extrabold tracking-wide">
                Plickify Academy
              </p>
              <p className="mt-1 text-sm text-brand-200">
                Learn · Practice · Build · Earn
              </p>
              <div className="relative mt-8 space-y-6 border-l-2 border-white/10 pl-6">
                {(content.storyTimeline ?? []).map((t, i) => (
                  <div key={t.year} className="relative">
                    <span
                      className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${i === (content.storyTimeline?.length ?? 1) - 1 ? "bg-brand-400 ring-4 ring-brand-400/30" : "bg-white/30"}`}
                    />
                    <p className="text-sm font-bold text-brand-300">{t.year}</p>
                    <p className="mt-0.5 text-sm text-zinc-300">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <SectionLabel>{content.storyLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.storyTitle}
            </h2>
            {(content.storyParagraphs ?? []).map((p) => (
              <p key={p} className="mt-4 leading-relaxed text-zinc-500">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[#F5F9FF] px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div
            className="rounded-3xl border border-brand-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
            data-aos="fade-up"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl text-white shadow-lg shadow-brand-600/30">
              <i className={content.missionIcon} />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-zinc-900">
              {content.missionTitle}
            </h3>
            <p className="mt-3 leading-relaxed text-zinc-500">
              {content.missionDesc}
            </p>
          </div>
          <div
            className="rounded-3xl bg-gradient-to-br from-slate-900 to-brand-900 p-8 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl text-brand-700 shadow-lg">
              <i className={content.visionIcon} />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold">
              {content.visionTitle}
            </h3>
            <p className="mt-3 leading-relaxed text-zinc-300">
              {content.visionDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center" data-aos="fade-up">
            <SectionLabel>{content.philosophyLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.philosophyTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
              {content.philosophySubtitle}
            </p>
          </div>
          <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="absolute left-0 right-0 top-10 hidden border-t-2 border-dashed border-brand-200 lg:block" />
            {(content.philosophySteps ?? []).map((step, i) => (
              <div key={step.title} className="relative text-center" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-2xl text-white shadow-xl shadow-brand-600/30">
                  <i className={step.icon} />
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-brand-600">
                  {step.sub}
                </p>
                <p className="mx-auto mt-2 max-w-[240px] text-sm text-zinc-500">
                  {step.desc}
                </p>
                {i < (content.philosophySteps?.length ?? 1) - 1 && (
                  <i className="fa-solid fa-arrow-right absolute -right-3 top-10 hidden text-brand-400 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Plickify */}
      <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center" data-aos="fade-up">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.whyTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(content.whyItems ?? []).map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
                  <i className={f.icon} />
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we teach */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center" data-aos="fade-up">
            <SectionLabel>{content.teachLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.teachTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(content.teachItems ?? []).map((t, i) => (
              <div
                key={t.title}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg hover:shadow-brand-100"
                data-aos="fade-up"
                data-aos-delay={i * 60}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-lg text-white shadow-md shadow-brand-600/30 transition-colors group-hover:bg-brand-700">
                  <i className={t.icon} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{t.desc}</p>
                </div>
                <i className="fa-solid fa-arrow-right mt-1 text-brand-500 transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="bg-[#F5F9FF] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center" data-aos="fade-up">
            <SectionLabel>{content.instructorsLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.instructorsTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {(content.instructors ?? []).map((inst, i) => (
              <div
                key={inst.name}
                className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-100"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${inst.color}`}>
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-3xl font-extrabold text-white shadow-xl backdrop-blur">
                      {inst.initials}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm text-brand-600 shadow-md">
                      <i className="fa-solid fa-circle-check" />
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-extrabold text-zinc-900">
                    {inst.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-brand-600">
                    {inst.role}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(inst.expertise ?? []).map((e) => (
                      <span
                        key={e}
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                    {inst.bio}
                  </p>
                  <div className="mt-5 flex items-center gap-2">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-brand-600 hover:text-white"
                      aria-label="Facebook"
                    >
                      <i className="fa-brands fa-facebook-f" />
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-red-600 hover:text-white"
                      aria-label="YouTube"
                    >
                      <i className="fa-brands fa-youtube" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-blue-600 hover:text-white"
                      aria-label="LinkedIn"
                    >
                      <i className="fa-brands fa-linkedin-in" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructor credibility */}
          <div
            className="mt-8 grid grid-cols-2 gap-6 rounded-3xl border border-zinc-100 bg-white p-8 sm:grid-cols-4"
            data-aos="fade-up"
          >
            {(content.credibility ?? []).map((c) => (
              <div key={c.label} className="text-center">
                <p className="text-2xl font-extrabold text-brand-600">
                  {c.value}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-400">
                  {c.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning experience */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center" data-aos="fade-up">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.journeyTitle}
            </h2>
          </div>
          <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-brand-200 lg:block" />
            {(content.journeySteps ?? []).map((s, i) => (
              <div key={s.num} className="relative text-center" data-aos="fade-up" data-aos-delay={i * 80}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-lg font-extrabold text-white shadow-lg shadow-brand-600/30">
                  {s.num}
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{s.title}</h3>
                <p className="mx-auto mt-1 max-w-[180px] text-sm text-zinc-500">
                  {s.desc}
                </p>
                {i < (content.journeySteps?.length ?? 1) - 1 && (
                  <i className="fa-solid fa-arrow-right absolute -right-3 top-8 hidden text-brand-400 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="bg-[#F5F9FF] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center" data-aos="fade-up">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.impactTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {(content.impactStats ?? []).map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm"
                data-aos="zoom-in"
                data-aos-delay={i * 60}
              >
                <p className="text-3xl font-extrabold text-brand-600">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p
            className="mx-auto mt-10 max-w-2xl text-center text-zinc-500"
            data-aos="fade-up"
          >
            {content.impactNote}
          </p>
        </div>
      </section>

      {/* Student success */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center" data-aos="fade-up">
            <SectionLabel>{content.successLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.successTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {(content.successStories ?? []).map((st, i) => (
              <div
                key={st.name}
                className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i key={n} className="fa-solid fa-star text-sm text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-zinc-600">“{st.text}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar initials={st.initials} color={st.color} />
                  <div>
                    <p className="font-bold text-zinc-900">{st.name}</p>
                    <p className="text-xs text-zinc-400">
                      {st.role} · {st.course}
                    </p>
                  </div>
                </div>
                {st.tag && (
                  <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <i className="fa-solid fa-award mr-1" />
                    {st.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center" data-aos="fade-up">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.valuesTitle}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(content.values ?? []).map((v, i) => (
              <div
                key={v.title}
                className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg text-brand-600">
                  <i className={v.icon} />
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{v.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 px-8 py-16 text-center sm:px-12">
          <div data-aos="zoom-in">
            <span className="text-xs font-bold tracking-[0.25em] text-brand-100">
              {content.communityLabel}
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
              {content.communityTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              {content.communityDesc}
            </p>
            <div className="mt-8 flex justify-center -space-x-3">
              {(content.communityAvatars ?? []).slice(0, 6).map((a) => (
                <Avatar
                  key={a.initials}
                  initials={a.initials}
                  color={a.color}
                  className="h-11 w-11 border-2 border-white text-xs"
                />
              ))}
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white/20 text-xs font-bold text-white backdrop-blur">
                +
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={content.communityPrimaryLink}
                className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-lg transition-colors hover:bg-brand-50"
              >
                {content.communityPrimary}
              </Link>
              <Link
                href={content.communitySecondaryLink}
                className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {content.communitySecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq
        content={{
          title: content.faqTitle,
          items: (content.faqItems ?? []).map((f) => ({ q: f.q, a: f.a })),
        }}
        items={dbFaqs.map((f) => ({ q: f.question, a: f.answer }))}
      />

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1a3a] to-brand-900 px-6 py-16 text-center sm:px-12">
          <div data-aos="zoom-in">
            <span className="text-xs font-bold tracking-[0.25em] text-brand-300">
              {content.ctaEyebrow}
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
              {content.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-300">
              {content.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={content.ctaPrimaryLink}
                className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
              >
                {content.ctaPrimary}
              </Link>
              <Link
                href={content.ctaSecondaryLink}
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {content.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}