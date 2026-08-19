import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAllLiveClasses,
  getEnrolledCourses,
  type LiveClassItem,
} from "@/lib/student";

export const metadata = { title: "Live Classes" };

function dateLabel(iso: string): { day: string; mon: string; time: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleDateString("en-US", { month: "short" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function ClassCard({ item }: { item: LiveClassItem }) {
  const { day, mon, time } = dateLabel(item.scheduled_at ?? "");
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      {item.scheduled_at && (
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
          <span className="text-xl font-extrabold leading-none">{day}</span>
          <span className="text-xs font-bold uppercase">{mon}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-zinc-900">{item.title}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {item.course?.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          {item.scheduled_at && (
            <span>
              <i className="fa-solid fa-clock mr-1 text-brand-500" />
              {time}
            </span>
          )}
          <span>
            <i className="fa-solid fa-user mr-1 text-brand-500" />
            {item.instructor}
          </span>
          {item.duration_minutes > 0 && (
            <span>
              <i className="fa-solid fa-hourglass-half mr-1 text-brand-500" />
              {item.duration_minutes} min
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {item.meeting_url && (
          <a
            href={item.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <i className="fa-solid fa-video" /> Join Class
          </a>
        )}
        {item.course && (
          <Link
            href={`/dashboard/courses/${item.course.id}`}
            className="inline-flex items-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Course
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function LiveClassesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courses = await getEnrolledCourses(user.id);
  const { upcoming, past } = await getAllLiveClasses(
    user.id,
    courses.map((c) => c.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Live Classes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upcoming and past live sessions from your enrolled courses.
        </p>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-video" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            No live classes yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Live sessions scheduled in your enrolled courses will appear here.
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Upcoming
              </h2>
              {upcoming.map((item) => (
                <ClassCard key={item.id} item={item} />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Past Sessions ({past.length})
              </h2>
              {past.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 opacity-75"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-700">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {item.course?.title} · {item.instructor}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">
                    {item.scheduled_at
                      ? new Date(item.scheduled_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase text-zinc-500">
                    Ended
                  </span>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}