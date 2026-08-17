import { siteStats } from "@/lib/site-config";

export function Stats() {
  return (
    <section className="bg-white px-4 pb-6 sm:px-6">
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 px-6 py-12 shadow-xl shadow-brand-700/30 sm:px-10"
        data-aos="fade-up"
      >
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {siteStats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center lg:border-white/15 ${
                i > 0 ? "lg:border-l" : ""
              }`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl text-white backdrop-blur">
                <i className={stat.icon} />
              </span>
              <p className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}