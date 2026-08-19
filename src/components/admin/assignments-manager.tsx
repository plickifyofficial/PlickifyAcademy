"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveAssignmentMeta,
  updateAssignmentGrade,
  deleteAssignmentGrade,
} from "@/lib/actions/admin";

export type AdminAssignment = {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  dueDate: string | null;
  totalPoints: number;
  instructions: string | null;
  submissions: {
    id: string;
    student: string;
    text: string;
    submittedAt: string;
    grade: number | null;
    feedback: string | null;
  }[];
};

export function AssignmentsManager({
  assignments,
}: {
  assignments: AdminAssignment[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);

  async function handleMeta(formData: FormData) {
    await saveAssignmentMeta(formData);
    setEditing((e) => ({ ...e, [String(formData.get("lesson_id"))]: false }));
    setMsg("Assignment details saved.");
    router.refresh();
  }

  async function handleGrade(formData: FormData) {
    await updateAssignmentGrade(formData);
    setMsg("Submission graded.");
    router.refresh();
  }

  async function handleUngrade(formData: FormData) {
    await deleteAssignmentGrade(formData);
    setMsg("Grade removed.");
    router.refresh();
  }

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-400">
          <i className="fa-solid fa-clipboard-check" />
        </span>
        <p className="mt-4 font-semibold text-zinc-900">No assignments yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
          Assignments are lessons with type &quot;Assignment&quot;. Add one in a
          course curriculum, then manage its due date, points, and submissions
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {msg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          {msg}
        </div>
      )}
      {assignments.map((a) => (
        <div
          key={a.lessonId}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
        >
          <div className="flex items-center justify-between gap-3 bg-zinc-50 px-4 py-3">
            <div className="min-w-0">
              <p className="font-bold text-zinc-900">{a.lessonTitle}</p>
              <p className="truncate text-xs text-zinc-500">{a.courseTitle}</p>
            </div>
            <button
              onClick={() =>
                setEditing((e) => ({ ...e, [a.lessonId]: !e[a.lessonId] }))
              }
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
            >
              {editing[a.lessonId] ? "Close" : "Edit Details"}
            </button>
          </div>

          {editing[a.lessonId] && (
            <form
              action={handleMeta}
              className="grid gap-3 border-b border-zinc-200 p-4 sm:grid-cols-2"
            >
              <input type="hidden" name="lesson_id" value={a.lessonId} />
              <input type="hidden" name="course_id" value={a.courseId} />
              <label className="block text-xs font-semibold text-zinc-600">
                Total points
                <input
                  name="total_points"
                  type="number"
                  min={1}
                  defaultValue={a.totalPoints}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-zinc-600">
                Due date
                <input
                  name="due_date"
                  type="datetime-local"
                  defaultValue={
                    a.dueDate
                      ? a.dueDate.slice(0, 16)
                      : ""
                  }
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-zinc-600 sm:col-span-2">
                Instructions
                <textarea
                  name="instructions"
                  rows={4}
                  defaultValue={a.instructions ?? ""}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save Details
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-zinc-100">
            {a.submissions.length === 0 ? (
              <p className="px-4 py-4 text-center text-xs text-zinc-400">
                No submissions yet.
              </p>
            ) : (
              a.submissions.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {s.student.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {s.student}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {new Date(s.submittedAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    {s.grade != null && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        {s.grade}/{a.totalPoints} pts
                      </span>
                    )}
                  </div>
                  <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2.5 text-sm whitespace-pre-wrap text-zinc-700">
                    {s.text}
                  </div>
                  {s.feedback && (
                    <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
                      <b>Feedback:</b> {s.feedback}
                    </div>
                  )}
                  <form
                    action={handleGrade}
                    className="mt-3 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="submission_id" value={s.id} />
                    <input type="hidden" name="course_id" value={a.courseId} />
                    <label className="block text-xs font-semibold text-zinc-600">
                      Grade
                      <input
                        name="grade"
                        type="number"
                        min={0}
                        max={a.totalPoints}
                        defaultValue={s.grade ?? ""}
                        placeholder={`0-${a.totalPoints}`}
                        className="mt-1 block w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block flex-1 text-xs font-semibold text-zinc-600">
                      Feedback
                      <input
                        name="feedback"
                        type="text"
                        defaultValue={s.feedback ?? ""}
                        placeholder="Add feedback for the student..."
                        className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      {s.grade != null ? "Update Grade" : "Grade"}
                    </button>
                    {s.grade != null && (
                      <button
                        formAction={handleUngrade}
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-500 hover:bg-zinc-50"
                      >
                        Clear
                      </button>
                    )}
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}