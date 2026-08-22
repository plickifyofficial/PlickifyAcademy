import type { DashboardContent } from "@/lib/content-schema";

const navIcons = [
  "fa-solid fa-gauge-high",
  "fa-solid fa-graduation-cap",
  "fa-solid fa-video",
  "fa-solid fa-certificate",
  "fa-solid fa-box-open",
  "fa-solid fa-user",
  "fa-solid fa-gear",
  "fa-solid fa-right-from-bracket",
];

const statIcons = [
  "fa-solid fa-book",
  "fa-solid fa-circle-check",
  "fa-solid fa-certificate",
  "fa-solid fa-chart-line",
];

const statColors = [
  "text-blue-600 bg-blue-50",
  "text-emerald-600 bg-emerald-50",
  "text-violet-600 bg-violet-50",
  "text-amber-600 bg-amber-50",
];

const achievementIcons = [
  "fa-solid fa-trophy",
  "fa-solid fa-medal",
];
const achievementColors = [
  "text-amber-500 bg-amber-50",
  "text-blue-600 bg-blue-50",
];

export function DashboardMockup({ content }: { content: DashboardContent }) {
  const navItems = content.navItems ?? [];
  const stats = content.stats ?? [];
  const courses = content.courses ?? [];
  const achievements = content.achievements ?? [];

  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="rounded-t-[1.4rem] rounded-b-none border border-zinc-700 bg-zinc-800 p-2 pb-0 shadow-2xl shadow-brand-900/30">
        <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="mx-auto flex items-center gap-1 rounded-md bg-zinc-700/80 px-3 py-1 text-[8px] text-zinc-400">
            <i className="fa-solid fa-lock text-[6px]" /> plickifyacademy.com/dashboard
          </span>
          <span className="w-8" />
        </div>

        <div className="flex h-[330px] overflow-hidden rounded-t-lg bg-zinc-50 sm:h-[380px]">
          <aside className="hidden w-24 shrink-0 flex-col border-r border-zinc-200 bg-white sm:flex">
            <div className="flex items-center gap-1 border-b border-zinc-100 px-2.5 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600">
                <i className="fa-solid fa-graduation-cap text-[8px] text-white" />
              </span>
              <span className="text-[9px] font-extrabold text-zinc-800">
                Plickify
              </span>
            </div>
            <nav className="flex-1 space-y-0.5 p-2">
              {navItems.map((label, i) => (
                <div
                  key={label + i}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[8px] font-medium ${
                    i === 0
                      ? "bg-blue-50 text-blue-700"
                      : "text-zinc-500"
                  }`}
                >
                  <i
                    className={`${navIcons[i] ?? "fa-solid fa-circle" } w-3 text-center text-[8px]`}
                  />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-2 overflow-hidden p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-zinc-900 sm:text-xs">
                  {content.welcomeText} {content.userName}
                </p>
                <p className="text-[7px] text-zinc-400">{content.tagline}</p>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[8px] font-bold text-white">
                {content.userInitials}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {stats.map((s, i) => (
                <div
                  key={s.label + i}
                  className="rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md ${
                      statColors[i] ?? "text-zinc-600 bg-zinc-100"
                    }`}
                  >
                    <i className={`${statIcons[i] ?? "fa-solid fa-chart-line"} text-[8px]`} />
                  </span>
                  <p className="mt-1 text-[9px] font-extrabold text-zinc-900">
                    {s.value}
                  </p>
                  <p className="truncate text-[6px] text-zinc-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[8px] font-bold text-zinc-800 sm:text-[10px]">
                  {content.myCoursesTitle}
                </p>
                <span className="text-[7px] text-blue-600">
                  {content.myCoursesViewAll}
                </span>
              </div>
              <div className="space-y-1.5">
                {courses.map((c, i) => (
                  <div
                    key={c.title + i}
                    className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-800 text-[8px] text-white">
                      <i className="fa-solid fa-robot" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[8px] font-semibold text-zinc-800">
                        {c.title}
                      </p>
                      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.max(0, Math.min(100, Number(c.pct) || 0))}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[7px] font-bold text-white">
                      {c.cta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm">
                <p className="text-[8px] font-bold text-zinc-800">
                  {content.earningsLabel}
                </p>
                <svg viewBox="0 0 100 28" className="mt-1 w-full">
                  <polyline
                    points="0,22 15,18 30,20 45,12 60,14 75,7 90,9 100,3"
                    fill="none"
                    stroke="#0757d9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="0,22 15,18 30,20 45,12 60,14 75,7 90,9 100,3"
                    fill="url(#grad)"
                    stroke="none"
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0757d9" />
                      <stop offset="100%" stopColor="#0757d9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <p className="text-[8px] font-extrabold text-emerald-600">
                  {content.earningsValue}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm">
                <p className="text-[8px] font-bold text-zinc-800">
                  {content.achievementsTitle}
                </p>
                <div className="mt-1 space-y-1">
                  {achievements.map((a, i) => (
                    <div key={a.title + i} className="flex items-center gap-1.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md ${
                          achievementColors[i] ?? "text-zinc-600 bg-zinc-100"
                        }`}
                      >
                        <i className={`${achievementIcons[i] ?? "fa-solid fa-trophy"} text-[7px]`} />
                      </span>
                      <div>
                        <p className="text-[7px] font-semibold text-zinc-700">
                          {a.title}
                        </p>
                        <p className="text-[6px] text-zinc-400">{a.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto h-4 w-[130%] max-w-none -translate-x-[11%] rounded-b-[3rem] bg-zinc-800" />
    </div>
  );
}
