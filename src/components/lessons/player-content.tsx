"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/lessons/video-player";
import { LessonTabs } from "@/components/lessons/lesson-tabs";
import { PlayerNav } from "@/components/lessons/player-nav";
import { QuizPlayer } from "@/components/lessons/quiz-player";
import { AssignmentPanel } from "@/components/lessons/assignment-panel";
import type { VideoRender } from "@/lib/video";
import type { QuizQuestion } from "@/lib/types";

type Neighbor = { id: string; title: string } | null;

export function PlayerContent({
  courseId,
  lessonId,
  lessonTitle,
  isQuiz,
  isAssignment,
  assignment,
  nowIso,
  render,
  poster,
  initialPosition,
  completed,
  passPercent,
  questions,
  description,
  content,
  resources,
  initialNote,
  comments,
  prevLesson,
  nextLesson,
  autoNext,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  isQuiz: boolean;
  isAssignment: boolean;
  assignment: {
    dueDate: string | null;
    totalPoints: number;
    instructions: string | null;
    submission: {
      text: string;
      submittedAt: string | null;
      grade: number | null;
      feedback: string | null;
    } | null;
  } | null;
  nowIso: string;
  render: VideoRender;
  poster?: string | null;
  initialPosition?: number;
  completed: boolean;
  passPercent?: number;
  questions?: QuizQuestion[];
  description: string | null;
  content: string | null;
  resources: {
    id: string;
    title: string;
    file_type: string | null;
    file_size: string | null;
  }[];
  initialNote: string;
  comments: { id: string; comment: string; created_at: string; author: string }[];
  prevLesson: Neighbor;
  nextLesson: Neighbor;
  autoNext: boolean;
}) {
  const router = useRouter();
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

  function handleAutoComplete() {
    router.refresh();
    if (autoNext && nextLesson) {
      setCountdown(5);
    }
  }

  return (
    <div className="min-w-0">
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
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
      )}

      <div className="overflow-hidden rounded-2xl bg-black">
        {isQuiz ? (
          <div className="bg-white p-4 sm:p-6">
            <QuizPlayer
              lessonId={lessonId}
              passPercent={passPercent ?? 60}
              questions={questions ?? []}
            />
          </div>
        ) : isAssignment && assignment ? (
          <AssignmentPanel
            lessonId={lessonId}
            dueDate={assignment.dueDate}
            totalPoints={assignment.totalPoints}
            instructions={assignment.instructions}
            nowIso={nowIso}
            submission={assignment.submission}
          />
        ) : (
          <VideoPlayer
            render={render}
            poster={poster}
            title={lessonTitle}
            lessonId={lessonId}
            initialPosition={initialPosition}
            onAutoComplete={handleAutoComplete}
          />
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
          {lessonTitle}
        </h1>
        {completed && (
          <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            ✓ Completed
          </span>
        )}
      </div>

      <div className="mt-4">
        <LessonTabs
          lessonId={lessonId}
          description={description}
          content={content}
          resources={resources}
          initialNote={initialNote}
          comments={comments}
        />
      </div>

      <div className="mt-6">
        <PlayerNav
          courseId={courseId}
          lessonId={lessonId}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          completed={completed}
          autoNext={autoNext}
        />
      </div>
    </div>
  );
}