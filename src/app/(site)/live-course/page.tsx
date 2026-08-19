import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Live Courses | Plickify Academy",
};

export const revalidate = 60;

type LiveRow = {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  meeting_url: string | null;
  course_id: string | null;
  courses: {
    title: string;
    slug: string;
    cover_image: string | null;
    created_by: string | null;
  } | null;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateBadge(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(d)
    .toUpperCase();
  return { day, month };
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

const whyCards = [
  {
    icon: "fa-solid fa-video",
    title: "Live Interaction",
    desc: "Instructor-এর সাথে সরাসরি শেখা।",
  },
  {
    icon: "fa-solid fa-comments",
    title: "Q&A Support",
    desc: "ক্লাসেই প্রশ্নের উত্তর পাওয়া।",
  },
  {
    icon: "fa-solid fa-clipboard-check",
    title: "Practical Tasks",
    desc: "প্রতিটি Skill Practice করার সুযোগ।",
  },
  {
    icon: "fa-solid fa-users",
    title: "Community",
    desc: "অন্যান্য শিক্ষার্থীদের সাথে শেখার সুযোগ।",
  },
];

const steps = [
  { n: "01", label: "Enroll" },
  { n: "02", label: "Get Class Schedule" },
  { n: "03", label: "Join Live Class" },
  { n: "04", label: "Practice" },
  { n: "05", label: "Get Recording" },
];

export default async function LiveCoursePage() {
  const supabase = await createClient();

  const { data: liveClasses } = await supabase
    .from("live_classes")
    .select(
      "id, title, description, scheduled_at, duration_minutes, meeting_url, course_id, courses(title, slug, cover_image, created_by)",
    )
    .order("scheduled_at", { ascending: true });

  const rows = (liveClasses ?? []) as unknown as LiveRow[];
  const now = Date.now();

  const creatorIds = [
    ...new Set(rows.map((r) => r.courses?.created_by).filter(Boolean)),
  ] as string[];
  const { data: instructors } =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [] };
  const instructorName = (id: string | null) =>
    instructors?.find((p) => p.id === id)?.full_name ||
    "Plickify Academy Instructor";

  const upcoming = rows
    .filter((r) => r.scheduled_at && new Date(r.scheduled_at).getTime() >= now)
    .slice(0, 6);

  const courseMap = new Map<
    string,
    { course: NonNullable<LiveRow["courses"]>; classes: LiveRow[] }
  >();
  for (const r of rows) {
    const c = r.courses;
    if (!c) continue;
    const entry = courseMap.get(c.slug) ?? { course: c, classes: [] };
    entry.classes.push(r);
    courseMap.set(c.slug, entry);
  }

  const liveCourses = [...courseMap.values()].map(({ course, classes }) => {
    const sorted = [...classes].filter((c) => c.scheduled_at).sort(
      (a, b) =>
        new Date(a.scheduled_at as string).getTime() -
        new Date(b.scheduled_at as string).getTime(),
    );
    const next = sorted.find(
      (c) => new Date(c.scheduled_at as string).getTime() >= now,
    );
    const nextClass = next ?? sorted[sorted.length - 1] ?? null;
    const completed = sorted.filter(
      (c) => new Date(c.scheduled_at as string).getTime() < now,
    ).length;
    const progress =
      sorted.length > 0 ? Math.round((completed / sorted.length) * 100) : 0;
    return { course, classCount: classes.length, nextClass, progress };
  });

  return (
    <main className="flex-1 bg-white">
      {/* 1. Hero */}
      <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            Live
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-zinc-900 sm:text-5xl">
            লাইভ কোর্স —{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
              সরাসরি শিখুন
            </span>
            , সাথে সাথে প্র্যাকটিস করুন
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600">
            Plickify Academy-এর Live Classes-এ Instructor-এর সাথে সরাসরি
            শিখুন, প্রশ্ন করুন এবং বাস্তব Project-এ Skill Apply করুন।
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#live-courses"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
            >
              View Live Courses
              <i className="fa-solid fa-arrow-down text-sm" />
            </a>
            <a
              href="#upcoming"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-8 py-3.5 text-base font-bold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600"
            >
              Upcoming Classes
            </a>
          </div>
        </div>
      </section>

      {/* 2. Live Course Cards */}
      <section id="live-courses" className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Live Batches
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              Choose Your Live Course
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              Every live course includes real-time classes, class recordings and
              practical assignments.
            </p>
          </div>

          {liveCourses.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liveCourses.map(({ course, classCount, nextClass, progress }) => (
                <div
                  key={course.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900">
                    {course.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.cover_image}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-white/40">
                        {course.title.charAt(0)}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      LIVE
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-zinc-900">
                      {course.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-2 text-sm text-zinc-600">
                      <i className="fa-solid fa-chalkboard-user text-brand-600" />
                      {instructorName(course.created_by)}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-zinc-600">
                      {nextClass?.scheduled_at ? (
                        <>
                          <p className="flex items-center gap-2">
                            <i className="fa-solid fa-calendar-days text-brand-600" />
                            Next Class: {formatDate(nextClass.scheduled_at)}
                          </p>
                          <p className="flex items-center gap-2">
                            <i className="fa-solid fa-clock text-brand-600" />
                            Time: {formatTime(nextClass.scheduled_at)}
                          </p>
                        </>
                      ) : (
                        <p className="flex items-center gap-2">
                          <i className="fa-solid fa-calendar-check text-brand-600" />
                          Schedule coming soon
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <i className="fa-solid fa-video text-brand-600" />
                        {classCount} Live Class{classCount === 1 ? "" : "es"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-zinc-500">
                        <span>Batch Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                      View Course
                      <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
              Live courses will appear here once live classes are scheduled.
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured Live Course */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div
            className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-800 to-brand-900 p-8 shadow-2xl shadow-brand-800/40 sm:p-12 lg:grid-cols-2"
            data-aos="zoom-in"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                <i className="fa-solid fa-circle text-[6px]" /> Featured Live
                Course
              </span>
              <h2 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">
                AI Income Mastery Batch 2026
              </h2>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-brand-200">
                3 Months • 25+ Live Classes
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  "Weekly 2 Live Classes",
                  "Class Recording Included",
                  "Daily Homework & Practice",
                  "VIP Community Support",
                  "Resource Pack",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-medium text-white/90"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      <i className="fa-solid fa-check text-[10px] text-white" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-center gap-8 lg:items-end">
              <div className="w-full max-w-sm rounded-2xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm text-brand-100">Next batch starts</p>
                <p className="mt-1 text-3xl font-extrabold text-white">
                  October 2026
                </p>
                <p className="mt-3 text-sm text-white/80">
                  Limited seats — secure your spot now.
                </p>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Join Live Course
                <i className="fa-solid fa-arrow-right text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Classes */}
      <section id="upcoming" className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Schedule
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              Upcoming Live Classes
            </h2>
          </div>

          {upcoming.length > 0 ? (
            <div className="mt-12 space-y-4">
              {upcoming.map((c) => {
                const badge = c.scheduled_at
                  ? formatDateBadge(c.scheduled_at)
                  : null;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                  >
                    {badge && (
                      <div className="flex w-20 shrink-0 flex-col items-center rounded-xl bg-brand-50 py-3">
                        <span className="text-2xl font-extrabold text-brand-700">
                          {badge.day}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
                          {badge.month}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        {c.courses?.title ?? "Plickify Academy"}
                      </p>
                      <p className="mt-0.5 truncate font-bold text-zinc-900">
                        {c.title}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-zinc-600">
                        <i className="fa-solid fa-clock text-brand-600" />
                        {c.scheduled_at ? formatTime(c.scheduled_at) : "TBA"}
                        {c.duration_minutes
                          ? ` • ${c.duration_minutes} min`
                          : ""}
                      </p>
                    </div>
                    {c.meeting_url ? (
                      <a
                        href={c.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Join Class
                      </a>
                    ) : (
                      <span className="shrink-0 rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-500">
                        Link coming soon
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
              No upcoming classes right now — check back soon.
            </div>
          )}
        </div>
      </section>

      {/* 5. Why Learn Live? */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Benefits
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              Why Learn Live?
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 text-center transition-shadow hover:shadow-lg"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
                  <i className={card.icon} />
                </span>
                <h3 className="mt-4 font-bold text-zinc-900">{card.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section className="bg-gradient-to-br from-brand-800 to-brand-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
              Process
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {steps.map((step, i) => (
              <div key={step.n} className="relative">
                <div className="flex h-full flex-col items-center rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-extrabold text-brand-700">
                    {step.n}
                  </span>
                  <p className="mt-4 text-sm font-semibold text-white">
                    {step.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white/50 lg:block">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center shadow-2xl shadow-brand-700/30 sm:p-14">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            পরবর্তী Live Class মিস করবেন না 🚀
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            আজই আপনার পছন্দের Live Course-এ Enroll করুন।
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
          >
            View All Live Courses
            <i className="fa-solid fa-arrow-right text-sm" />
          </Link>
        </div>
      </section>
    </main>
  );
}