const sideItems = [
  { icon: "fa-solid fa-gauge-high", label: "Dashboard", active: true },
  { icon: "fa-solid fa-graduation-cap", label: "My Courses" },
  { icon: "fa-solid fa-video", label: "Live Classes" },
  { icon: "fa-solid fa-certificate", label: "Certificates" },
  { icon: "fa-solid fa-box-open", label: "Products" },
  { icon: "fa-solid fa-user", label: "Profile" },
  { icon: "fa-solid fa-gear", label: "Settings" },
  { icon: "fa-solid fa-right-from-bracket", label: "Logout" },
];

const statCards = [
  { label: "Total Courses", value: "8", icon: "fa-solid fa-book", color: "text-blue-600 bg-blue-50" },
  { label: "Completed", value: "5", icon: "fa-solid fa-circle-check", color: "text-emerald-600 bg-emerald-50" },
  { label: "Certificates", value: "3", icon: "fa-solid fa-certificate", color: "text-violet-600 bg-violet-50" },
  { label: "Progress", value: "78%", icon: "fa-solid fa-chart-line", color: "text-amber-600 bg-amber-50" },
];

const myCourses = [
  { title: "AI Income Mastery", pct: 78 },
  { title: "Digital Marketing Pro", pct: 45 },
];

export function DashboardMockup() {
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
              {sideItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[8px] font-medium ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-zinc-500"
                  }`}
                >
                  <i className={`${item.icon} w-3 text-center text-[8px]`} />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </nav>
          </aside>

          <div className="flex-1 space-y-2 overflow-hidden p-2.5 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-zinc-900 sm:text-xs">
                  Welcome back, Minhajul Islam
                </p>
                <p className="text-[7px] text-zinc-400">Keep learning, keep growing!</p>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[8px] font-bold text-white">
                MI
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md ${s.color}`}>
                    <i className={`${s.icon} text-[8px]`} />
                  </span>
                  <p className="mt-1 text-[9px] font-extrabold text-zinc-900">{s.value}</p>
                  <p className="truncate text-[6px] text-zinc-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[8px] font-bold text-zinc-800 sm:text-[10px]">
                  My Courses
                </p>
                <span className="text-[7px] text-blue-600">View All</span>
              </div>
              <div className="space-y-1.5">
                {myCourses.map((c) => (
                  <div
                    key={c.title}
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
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[7px] font-bold text-white">
                      Continue
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm">
                <p className="text-[8px] font-bold text-zinc-800">Earnings Overview</p>
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
                <p className="text-[8px] font-extrabold text-emerald-600">+$1,240</p>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-white p-1.5 shadow-sm">
                <p className="text-[8px] font-bold text-zinc-800">Achievements</p>
                <div className="mt-1 space-y-1">
                  {[
                    { icon: "fa-solid fa-trophy", t: "Course Completed", c: "text-amber-500 bg-amber-50" },
                    { icon: "fa-solid fa-medal", t: "Top Student", c: "text-blue-600 bg-blue-50" },
                  ].map((a) => (
                    <div key={a.t} className="flex items-center gap-1.5">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md ${a.c}`}>
                        <i className={`${a.icon} text-[7px]`} />
                      </span>
                      <div>
                        <p className="text-[7px] font-semibold text-zinc-700">{a.t}</p>
                        <p className="text-[6px] text-zinc-400">Certificate issued</p>
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