import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentList, type AssignmentListItem } from "@/lib/student";
import { cn } from "@/lib/utils";

export const metadata = { title: "Assignments" };

const nowMs = Date.now();

function dueText(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const overdue = d.getTime() < nowMs;
  return `${overdue ? "Due" : "Due"} ${d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}${overdue ? " (overdue)" : ""}`;
}

function StatusBadge({ item }: { item: AssignmentListItem }) {
  if (item.graded)
    return (
      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">
        Graded · {item.grade}/{item.totalPoints}
      </span>
    );
  if (item.submittedAt)
    return (
      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-700">
        Submitted
      </span>
    );
  return (
    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-500">
      Not Submitted
    </span>
  );
}

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignments = await getAssignmentList(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Assignments</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Submit and track your assignments across enrolled courses.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-clipboard-check" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            No assignments yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Assignments from your enrolled courses will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/learn/${a.course.id}/${a.id}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-900 group-hover:text-brand-700">
                    {a.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {a.course.title}
                  </p>
                </div>
                <StatusBadge item={a} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <span>
                  <i className="fa-solid fa-star mr-1 text-brand-500" />
                  {a.totalPoints} points
                </span>
                {a.submittedAt ? (
                  <span>
                    <i className="fa-solid fa-check mr-1 text-green-600" />
                    Submitted{" "}
                    {new Date(a.submittedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "font-semibold",
                      a.dueDate && new Date(a.dueDate).getTime() < nowMs
                        ? "text-red-500"
                        : "text-zinc-500",
                    )}
                  >
                    <i className="fa-solid fa-calendar mr-1" />
                    {dueText(a.dueDate) ?? "No due date"}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}