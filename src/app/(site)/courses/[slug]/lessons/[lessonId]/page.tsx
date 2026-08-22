import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkCompleteButton } from "@/components/lessons/mark-complete-button";
import { QuizPlayer } from "@/components/lessons/quiz-player";
import { ResumeTracker } from "@/components/lessons/resume-tracker";
import { VideoPlayer } from "@/components/lessons/video-player";
import { buildProtectedRender } from "@/lib/video-access";
import { ProseContent } from "@/components/editor/prose-content";
import { renderContent } from "@/lib/rte";
import type { QuizQuestion } from "@/lib/types";

export const metadata = { title: "Lesson" };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", course.id)
    .single();

  if (!lesson) notFound();

  const { data: allTopics } = await supabase
    .from("lessons")
    .select("id, title, section_id, order")
    .eq("course_id", course.id);

  const { data: sections } = await supabase
    .from("course_sections")
    .select("id, position")
    .eq("course_id", course.id);

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  let enrollmentDate: string | null = null;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
    enrollmentDate = enrollment?.created_at ?? null;
  }

  const canAccess = isEnrolled;

  // drip content: release N days after enrollment
  let dripLocked = false;
  let unlockAt: Date | null = null;
  if (isEnrolled && !lesson.is_free && (lesson.release_days ?? 0) > 0 && enrollmentDate) {
    unlockAt = new Date(new Date(enrollmentDate).getTime() + (lesson.release_days ?? 0) * 86400000);
    dripLocked = new Date() < unlockAt;
  }

  if (!canAccess || dripLocked) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-500">
          <i className="fa-solid fa-lock" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">
          {dripLocked ? "Not Unlocked Yet" : "No Access"}
        </h1>
        <p className="mt-3 text-zinc-600">
          {dripLocked && unlockAt
            ? `This topic will unlock on ${unlockAt.toLocaleDateString("en-US")}.`
            : `You need to enroll in this course to view this topic.`}
        </p>
        <Link
          href={`/courses/${course.slug}`}
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Back to Course Page
        </Link>
      </main>
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
    <main className="mx-auto max-w-4xl flex-1 px-4 py-10">
      <ResumeTracker courseId={course.id} lessonId={lesson.id} />

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/courses/${course.slug}`}
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
            <div className="-mx-4 mt-0 overflow-hidden bg-black sm:mx-0 sm:mt-6 sm:rounded-2xl">
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
            <div className="mt-8">
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <ProseContent html={renderContent(lesson.content)} />
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
            href={`/courses/${course.slug}/lessons/${prevLesson.id}`}
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
            courseSlug={course.slug}
            nextLessonId={nextLesson?.id ?? null}
            isAuthenticated={!!user}
          />
        )}

        {nextLesson && (
          <Link
            href={`/courses/${course.slug}/lessons/${nextLesson.id}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Next Topic →
          </Link>
        )}
      </div>
    </main>
  );
}