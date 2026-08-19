"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAssignment } from "@/lib/actions/learning";

export function AssignmentPanel({
  lessonId,
  dueDate,
  totalPoints,
  instructions,
  nowIso,
  submission,
}: {
  lessonId: string;
  dueDate: string | null;
  totalPoints: number;
  instructions: string | null;
  nowIso: string;
  submission: {
    text: string;
    submittedAt: string | null;
    grade: number | null;
    feedback: string | null;
  } | null;
}) {
  const router = useRouter();
  const [text, setText] = useState(submission?.text ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (text.trim().length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await submitAssignment(lessonId, text);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setPending(false);
    }
  }

  const graded = submission?.grade != null;

  return (
    <div className="bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            Assignment
          </span>
          <span className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
            {totalPoints} points
          </span>
          {dueDate && (
            <span
              className={`rounded-lg px-3 py-1 text-xs font-bold ${
                new Date(dueDate).getTime() < new Date(nowIso).getTime()
                  ? "bg-red-50 text-red-600"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              Due {new Date(dueDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {graded && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            Graded: {submission.grade}/{totalPoints}
          </span>
        )}
      </div>

      {instructions && (
        <div className="prose-sm mt-4 whitespace-pre-wrap text-sm text-zinc-700">
          {instructions}
        </div>
      )}

      {graded ? (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Your Submission
            </p>
            <div className="mt-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm whitespace-pre-wrap text-zinc-700">
              {submission?.text}
            </div>
          </div>
          {submission?.feedback && (
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                Instructor Feedback
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-800">
                {submission.feedback}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          {submission?.submittedAt ? (
            <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
              <i className="fa-solid fa-circle-check mr-2" />
              Submitted{" "}
              {new Date(submission.submittedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              . You can update your submission until it is graded.
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              Write your answer below and submit.
            </p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Type your assignment answer here..."
            className="mt-3 w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={pending}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Submitting..." : submission?.submittedAt ? "Update Submission" : "Submit Assignment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}