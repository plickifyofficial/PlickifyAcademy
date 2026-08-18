import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkCompleteButton } from "@/components/lessons/mark-complete-button";
import { QuizPlayer } from "@/components/lessons/quiz-player";
import { ResumeTracker } from "@/components/lessons/resume-tracker";
import { VideoPlayer } from "@/components/lessons/video-player";
import { buildProtectedRender } from "@/lib/video-access";
import type { QuizQuestion } from "@/lib/types";

export const metadata = { title: "Lesson" };

export default async function DashboardLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();
  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single();
  if (!lesson) notFound();

  const { data: allTopics } = await supabase
    .from("lessons")
    .select("id, title, section_id, order")
    .eq("course_id", courseId);

  const { data: sections } = await supabase
    .from("course_sections")
    .select("id, position")
    .eq("course_id", courseId);

  const sectionPos: Record<string, number> = {};
  for (const s of sections ?? []) {
    sectionPos[s.id] = s.position;
  }

  const allLessons = (allTopics ?? [])
    .filter((t) => t.section_id)
    .sort((a, b) => {
      const pa = sectionPos[a.section_id ?? ""] ?? 0;
      const pb = sectionPos[b.section_id ?? ""] ?? 0;
      return pa - pb || a.order - b.order;
    });

  let dripLocked = false;
  let unlockAt: Date | null = null;
  if (
    !lesson.is_free &&
    (lesson.release_days ?? 0) > 0 &&
    enrollment.created_at
  ) {
    unlockAt = new Date(
      new Date(enrollment.created_at).getTime() +
        (lesson.release_days ?? 0) * 86400000,
    );
    dripLocked = new Date() < unlockAt;
  }

  if (dripLocked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-500">
          <i className="fa-solid fa-lock" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">
          Not Unlocked Yet
        </h1>
        <p className="mt-3 text-zinc-600">
          {unlockAt
            ? `This topic will unlock on ${unlockAt.toLocaleDateString("en-US")}.`
            : "This topic will unlock later."}
        </p>
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Back to Course
        </Link>
      </div>
    );
  }

  const idx = allLessons?.findIndex((l) => l.id === lesson.id) ?? 0;
  const prevLesson = idx > 0 ? allLessons?.[idx - 1] : null;
  const nextLesson =
    allLessons && idx < allLessons.length - 1 ? allLessons?.[idx + 1] : null;

  let questions: QuizQuestion[] = [];
  if (lesson.type === "quiz") {
    const { data: qs } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("position", { ascending: true });
    questions = (qs ?? []) as unknown as QuizQuestion[];
  }

  return (
    <div>
      <ResumeTracker courseId={course.id} lessonId={lesson.id} />

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          ← {course.title}
        </Link>
        {lesson.type !== "lesson" && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold capitalize text-brand-700">
            <i
              className={`mr-1 ${
                lesson.type === "quiz"
                  ? "fa-solid fa-circle-question"
                  : lesson.type === "video"
                    ? "fa-solid fa-video"
                    : "fa-solid fa-clipboard-check"
              }`}
            />
            {lesson.type === "quiz"
              ? "Quiz"
              : lesson.type === "video"
                ? "Video"
                : "Assignment"}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-2xl font-bold text-zinc-900">{lesson.title}</h1>

      {lesson.type === "quiz" ? (
        <div className="mt-6">
          <QuizPlayer
            lessonId={lesson.id}
            passPercent={lesson.pass_percent ?? 60}
            questions={questions}
          />
        </div>
      ) : (
        <>
          {lesson.video_url || lesson.video_embed ? (
            <div className="mt-6 overflow-hidden rounded-2xl bg-black">
              <VideoPlayer
                render={buildProtectedRender(
                  lesson.video_url,
                  lesson.video_embed,
                  course.id,
                  lesson.id,
                )}
                poster={course.cover_image}
                title={lesson.title}
              />
            </div>
          ) : null}

          {lesson.content && (
            <div className="prose prose-zinc mt-8 max-w-none">
              <div className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
                {lesson.content}
              </div>
            </div>
          )}

          {lesson.description && (
            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 text-zinc-600">
              {lesson.description}
            </div>
          )}
        </>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        {prevLesson ? (
          <Link
            href={`/dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            ← Previous Topic
          </Link>
        ) : (
          <span />
        )}

        {lesson.type !== "quiz" && (
          <MarkCompleteButton
            lessonId={lesson.id}
            courseSlug={courseId}
            nextLessonId={nextLesson?.id ?? null}
            isAuthenticated={!!user}
            hrefPrefix="/dashboard/courses"
          />
        )}

        {nextLesson && (
          <Link
            href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Next Topic →
          </Link>
        )}
      </div>
    </div>
  );
}