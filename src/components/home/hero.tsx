import Link from "next/link";
import { DashboardMockup } from "@/components/home/dashboard-mockup";

const avatars = [
  { initials: "RH", color: "bg-blue-500" },
  { initials: "NJ", color: "bg-violet-500" },
  { initials: "MH", color: "bg-emerald-500" },
  { initials: "SA", color: "bg-amber-500" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute -top-28 right-[-8%] h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-48 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pt-20">
        <div data-aos="fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            <i className="fa-solid fa-wand-magic-sparkles" />
            AI Skills · Freelancing · Digital Income
          </span>

          <h1 className="mt-6 text-[42px] font-extrabold leading-[1.15] tracking-tight text-zinc-900 sm:text-[50px] lg:text-[54px]">
            AI দিয়ে আপনার{" "}
            <span className="text-brand-600">ডিজিটাল ক্যারিয়ার</span> শুরু
            করুন
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            AI Skills, Freelancing, Passive Income এবং Real-World Projects
            শেখার মাধ্যমে আপনার ডিজিটাল ক্যারিয়ার গড়ে তুলুন।
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
            >
              এখনই শুরু করুন
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-300 bg-white px-8 py-3.5 text-base font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              <i className="fa-solid fa-play text-sm" />
              কোর্স দেখুন
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <div className="flex -space-x-2.5">
              {avatars.map((a) => (
                <span
                  key={a.initials}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-sm ${a.color}`}
                >
                  {a.initials}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                  <i className="fa-solid fa-star" />
                </span>
                <span className="text-sm font-bold text-zinc-900">4.9/5</span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">
                500+ Reviews
              </p>
            </div>
          </div>
        </div>

        <div data-aos="fade-up" data-aos-delay="150">
          <DashboardMockup />
        </div>
      </div>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-16 w-full text-brand-600 sm:h-24"
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