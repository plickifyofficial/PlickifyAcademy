import type { LiveClass } from "@/lib/types";

type Props = {
  classes: LiveClass[];
  isEnrolled: boolean;
};

export function LiveClassesSection({ classes, isEnrolled }: Props) {
  if (classes.length === 0) return null;

  const upcoming = classes
    .filter((c) => !c.scheduled_at || new Date(c.scheduled_at) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.scheduled_at ?? 0).getTime() -
        new Date(b.scheduled_at ?? 0).getTime(),
    );
  const past = classes.filter((c) => !upcoming.includes(c));

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
      <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900">
        <i className="fa-solid fa-video text-brand-600" /> Live Classes
      </h2>

      {upcoming.length === 0 && past.length === 0 && (
        <p className="mt-3 text-sm text-zinc-500">No live classes scheduled.</p>
      )}

      <div className="mt-4 space-y-3">
        {upcoming.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-brand-100 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-900">{c.title}</p>
                {c.description && (
                  <p className="mt-1 text-sm text-zinc-500">{c.description}</p>
                )}
                <p className="mt-2 text-xs font-medium text-brand-600">
                  <i className="fa-regular fa-calendar mr-1" />
                  {c.scheduled_at
                    ? new Date(c.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Date to be announced"}
                  {c.duration_minutes > 0 && (
                    <span className="ml-2 text-zinc-400">
                      • {c.duration_minutes} min
                    </span>
                  )}
                </p>
              </div>
              {isEnrolled && c.meeting_url && (
                <a
                  href={c.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <i className="fa-solid fa-video mr-1" /> Join
                </a>
              )}
            </div>
          </div>
        ))}

        {past.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-600">
              Previous live classes ({past.length})
            </summary>
            <div className="mt-2 space-y-2">
              {past.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-zinc-100 bg-white px-4 py-3"
                >
                  <p className="text-sm font-medium text-zinc-700">{c.title}</p>
                  <p className="text-xs text-zinc-400">
                    {c.scheduled_at
                      ? new Date(c.scheduled_at).toLocaleDateString("en-US", {
                          dateStyle: "medium",
                        })
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}