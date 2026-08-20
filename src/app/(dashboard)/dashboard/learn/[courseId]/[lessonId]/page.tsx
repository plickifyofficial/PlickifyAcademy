import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayerShell } from "@/components/dashboard/player-shell";
import { PlayerContent } from "@/components/lessons/player-content";
import { ResumeTracker } from "@/components/lessons/resume-tracker";
import type { PlayerCurSection } from "@/components/dashboard/player-curriculum";
import { buildProtectedRender } from "@/lib/video-access";
import type { QuizQuestion } from "@/lib/types";

export const metadata = { title: "Lesson" };

const SERVER_NOW_ISO = new Date().toISOString();

export default async function LearnLessonPage({
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

  const [
    { data: allTopics },
    { data: sections },
    { data: progressRows },
    { data: state },
    { data: resources },
    { data: notes },
    { data: comments },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, section_id, order, duration_minutes, type")
      .eq("course_id", courseId),
    supabase
      .from("course_sections")
      .select("id, title, position")
      .eq("course_id", courseId)
      .order("position", { ascending: true }),
    supabase
      .from("lesson_progress")
      .select("lesson_id, completed, position_seconds")
      .eq("user_id", user.id),
    supabase
      .from("user_course_state")
      .select("last_lesson_id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle(),
    supabase
      .from("lesson_resources")
      .select("id, title, file_type, file_size")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true }),
    supabase
      .from("lesson_notes")
      .select("note")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle(),
    supabase
      .from("lesson_comments")
      .select("id, comment, created_at, user_id, profiles(full_name)")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase
      .from("site_settings")
      .select("auto_next_lesson")
      .eq("id", 1)
      .single(),
  ]);

  const sectionPos: Record<string, number> = {};
  const sectionTitles: Record<string, string> = {};
  for (const s of sections ?? []) {
    sectionPos[s.id] = s.position;
    sectionTitles[s.id] = s.title;
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

  const doneSet = new Set(
    (progressRows ?? [])
      .filter((p) => p.completed)
      .map((p) => p.lesson_id),
  );
  const doneCount = allLessons.filter((l) => doneSet.has(l.id)).length;
  const percent =
    allLessons.length > 0 ? Math.round((doneCount / allLessons.length) * 100) : 0;

  const resumeLesson =
    allLessons.find((t) => t.id === state?.last_lesson_id) ?? allLessons[0];

  const curriculum: PlayerCurSection[] = (sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    items: (allTopics ?? [])
      .filter((t) => t.section_id === section.id)
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        type: topic.type,
        duration_minutes: topic.duration_minutes,
        done: doneSet.has(topic.id),
        locked: false,
        current: topic.id === lesson.id,
      })),
  }));

  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
  const nextLesson =
    allLessons && idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

  const currentProgress = (progressRows ?? []).find(
    (p) => p.lesson_id === lesson.id,
  );
  const completed = currentProgress?.completed === true;
  const initialPosition = currentProgress?.position_seconds ?? 0;

  const myNote = (notes as unknown as { note: string } | null)?.note ?? "";

  const commentList = (comments ?? [])
    .map((c) => {
      const p = c.profiles as unknown as { full_name: string | null } | null;
      return {
        id: c.id,
        comment: c.comment,
        created_at: c.created_at,
        author: p?.full_name || "Student",
      };
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

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
          href={`/dashboard/learn/${courseId}/${resumeLesson?.id ?? ""}`}
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Back to Course
        </Link>
      </div>
    );
  }

  let questions: QuizQuestion[] = [];
  if (lesson.type === "quiz") {
    const { data: qs } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("position", { ascending: true });
    questions = (qs ?? []) as unknown as QuizQuestion[];
  }

  let assignment: {
    dueDate: string | null;
    totalPoints: number;
    instructions: string | null;
    submission: {
      text: string;
      submittedAt: string | null;
      grade: number | null;
      feedback: string | null;
    } | null;
  } | null = null;
  if (lesson.type === "assignment") {
    const [{ data: assignmentRow }, { data: submission }] = await Promise.all([
      supabase
        .from("assignments")
        .select("due_date, total_points, instructions")
        .eq("lesson_id", lesson.id)
        .maybeSingle(),
      supabase
        .from("assignment_submissions")
        .select("submission_text, submitted_at, grade, feedback")
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id)
        .maybeSingle(),
    ]);
    if (assignmentRow) {
      assignment = {
        dueDate: assignmentRow.due_date,
        totalPoints: assignmentRow.total_points,
        instructions: assignmentRow.instructions,
        submission: submission
          ? {
              text: submission.submission_text,
              submittedAt: submission.submitted_at,
              grade: submission.grade,
              feedback: submission.feedback,
            }
          : null,
      };
    }
  }

  const autoNext = settings?.auto_next_lesson === true;

  return (
    <div>
      <ResumeTracker courseId={course.id} lessonId={lesson.id} />

      <header className="sticky top-16 z-20 -mx-4 mb-5 border-b border-zinc-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
            title="Back to Course"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {course.title}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {sectionTitles[lesson.section_id ?? ""] ?? "Course"} ·{" "}
              {lesson.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-zinc-700">{percent}%</span>
            </div>
            <Link
              href={`/dashboard/courses/${courseId}`}
              className="flex min-h-11 items-center rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
            >
              Exit Course
            </Link>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 sm:hidden">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-zinc-600">{percent}%</span>
        </div>
      </header>

      <PlayerShell
        courseId={courseId}
        percent={percent}
        doneCount={doneCount}
        totalCount={allLessons.length}
        sections={curriculum}
      >
        <PlayerContent
          courseId={courseId}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          isQuiz={lesson.type === "quiz"}
          isAssignment={lesson.type === "assignment"}
          assignment={assignment}
          nowIso={SERVER_NOW_ISO}
          render={buildProtectedRender(
            lesson.video_url,
            lesson.video_embed,
            courseId,
            lesson.id,
          )}
          poster={course.cover_image}
          initialPosition={initialPosition}
          completed={completed}
          passPercent={lesson.pass_percent ?? 60}
          questions={questions}
          description={lesson.description}
          content={lesson.content}
          resources={
            (resources ?? []) as unknown as {
              id: string;
              title: string;
              file_type: string | null;
              file_size: string | null;
            }[]
          }
          initialNote={myNote}
          comments={commentList}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          autoNext={autoNext}
        />
      </PlayerShell>
    </div>
  );
}