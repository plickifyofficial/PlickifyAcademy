"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateLessonProgress } from "@/lib/actions/learning";

type Neighbor = { id: string; title: string } | null;

export function PlayerNav({
  courseId,
  lessonId,
  prevLesson,
  nextLesson,
  completed,
  autoNext,
}: {
  courseId: string;
  lessonId: string;
  prevLesson: Neighbor;
  nextLesson: Neighbor;
  completed: boolean;
  autoNext: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (!navigatedRef.current && nextLesson) {
        navigatedRef.current = true;
        router.push(`/dashboard/learn/${courseId}/${nextLesson.id}`);
      }
      return;
    }
    const t = window.setTimeout(() => setCountdown((v) => (v ?? 0) - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, nextLesson, courseId, router]);

  async function handleComplete() {
    setPending(true);
    try {
      await updateLessonProgress({ lessonId, complete: true });
      router.refresh();
      if (autoNext && nextLesson) {
        setCountdown(5);
      } else if (nextLesson) {
        router.push(`/dashboard/learn/${courseId}/${nextLesson.id}`);
      }
    } catch {
      // keep button usable
    } finally {
      setPending(false);
    }
  }

  if (countdown !== null && countdown > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            <i className="fa-solid fa-circle-check" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-zinc-900">
            Lesson Completed ✓
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Next lesson starting in{" "}
            <span className="font-bold text-brand-600">{countdown}</span>...
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setCountdown(0)}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Start Now
            </button>
            <button
              onClick={() => setCountdown(null)}
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {prevLesson ? (
        <Link
          href={`/dashboard/learn/${courseId}/${prevLesson.id}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 sm:inline-flex sm:w-auto"
        >
          <i className="fa-solid fa-arrow-left" /> Previous Lesson
        </Link>
      ) : (
        <span />
      )}

      <button
        onClick={handleComplete}
        disabled={completed || pending}
        className={
          completed
            ? "flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 sm:inline-flex sm:w-auto"
            : "flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:inline-flex sm:w-auto"
        }
      >
        <i
          className={
            completed ? "fa-solid fa-circle-check" : "fa-solid fa-check"
          }
        />
        {pending ? "Saving..." : completed ? "Completed ✓" : "Mark as Complete"}
      </button>

      {nextLesson ? (
        <Link
          href={`/dashboard/learn/${courseId}/${nextLesson.id}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:inline-flex sm:w-auto"
        >
          Next Lesson <i className="fa-solid fa-arrow-right" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}