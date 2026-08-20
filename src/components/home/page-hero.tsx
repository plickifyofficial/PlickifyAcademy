export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute -top-28 right-[-6%] h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute left-[-4%] top-40 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
          <i className="fa-solid fa-wand-magic-sparkles" />
          {eyebrow}
        </span>
        <h1 className="page-title mt-5 font-extrabold tracking-tight text-zinc-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {subtitle}
          </p>
        )}
      </div>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-12 w-full text-brand-600 sm:h-16"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0,64 C240,118 480,6 720,44 C960,82 1200,104 1440,52 L1440,120 L0,120 Z" />
      </svg>
    </section>
  );
}
