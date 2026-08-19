import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CourseCurriculum,
  type CurSection,
} from "@/components/dashboard/course-curriculum";
import type { Lesson } from "@/lib/types";
import { formatDuration } from "@/lib/student";
import { CertificateButton } from "@/components/courses/certificate-button";

export const metadata = { title: "My Course" };

export default async function DashboardCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
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

  const { data: instructorProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", course.created_by ?? "")
    .maybeSingle();

  const enrollmentCreatedAt = enrollment.created_at;

  const [{ data: sections }, { data: topics }, { data: progress }, { data: state }] =
    await Promise.all([
      supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("position", { ascending: true }),
      supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order", { ascending: true }),
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", user.id),
      supabase
        .from("user_course_state")
        .select("last_lesson_id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle(),
    ]);

  const allTopics = (topics ?? []).filter((t) => t.section_id);
  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const done = allTopics.filter((t) => completedIds.has(t.id)).length;
  const pct = allTopics.length > 0 ? Math.round((done / allTopics.length) * 100) : 0;

  function isDripLocked(topic: Lesson): boolean {
    if (topic.is_free || (topic.release_days ?? 0) <= 0 || !enrollmentCreatedAt)
      return false;
    const unlock = new Date(
      new Date(enrollmentCreatedAt).getTime() + topic.release_days * 86400000,
    );
    return new Date() < unlock;
  }

  const resumeTopic =
    allTopics.find((t) => t.id === state?.last_lesson_id) ?? allTopics[0];

  const curriculum: CurSection[] = (sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    items: (topics ?? [])
      .filter((t) => t.section_id === section.id)
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        type: topic.type,
        duration_minutes: topic.duration_minutes,
        done: completedIds.has(topic.id),
        locked: isDripLocked(topic),
        current: topic.id === resumeTopic?.id,
      })),
  }));

  const completedModules = curriculum.filter(
    (s) => s.items.length > 0 && s.items.every((i) => i.done),
  ).length;
  const remainingLessons = allTopics.length - done;
  const remainingMinutes = allTopics
    .filter((t) => !completedIds.has(t.id))
    .reduce((s, t) => s + (t.duration_minutes || 0), 0);

  const instructor = instructorProfile?.full_name || "Instructor";
  const isCompleted = allTopics.length > 0 && done >= allTopics.length;
  const isNotStarted = done === 0;

  const { data: certificate } = await supabase
    .from("certificates")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/courses" className="hover:text-brand-600">
          My Courses
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="truncate font-medium text-zinc-900">
          {course.title}
        </span>
      </nav>

      <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 sm:w-56">
            {course.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.cover_image}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-5xl font-black">{course.title.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{course.title}</h1>
            {course.subtitle && (
              <p className="mt-1 text-sm font-medium text-brand-100">{course.subtitle}</p>
            )}
            <p className="mt-2 text-sm text-brand-200">
              <i className="fa-solid fa-user mr-1.5" />
              {instructor}
              <span className="mx-2">·</span>
              <i className="fa-solid fa-book-open mr-1" />
              {allTopics.length} lessons
              <span className="mx-2">·</span>
              <i className="fa-solid fa-clock mr-1" />
              {formatDuration(
                allTopics.reduce((s, t) => s + (t.duration_minutes || 0), 0),
              )}
            </p>
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs text-brand-100">
                <span>Your Progress</span>
                <span className="font-bold text-white">{pct}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-brand-200">
                {done}/{allTopics.length} lessons completed
              </p>
            </div>
            {resumeTopic && (
              <Link
                href={`/dashboard/learn/${courseId}/${resumeTopic.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50"
              >
                <i className="fa-solid fa-play" />
                {isCompleted
                  ? "Review Course"
                  : isNotStarted
                    ? "Start Course"
                    : "Continue Learning"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-4">
        <div>
          <p className="text-2xl font-extrabold text-brand-700">{done}</p>
          <p className="text-xs text-zinc-500">of {allTopics.length} lessons completed</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-zinc-900">{pct}%</p>
          <p className="text-xs text-zinc-500">Overall completion</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-zinc-900">{completedModules}</p>
          <p className="text-xs text-zinc-500">modules completed</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-zinc-900">
            {remainingLessons}
            <span className="text-sm font-medium text-zinc-400"> · {formatDuration(remainingMinutes)}</span>
          </p>
          <p className="text-xs text-zinc-500">remaining to finish</p>
        </div>
      </div>

      {isCompleted && (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center text-white sm:flex-row sm:text-left">
          <span className="text-4xl">🎉</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Course Completed!</h2>
            <p className="text-sm text-green-100">
              Congratulations on finishing all lessons. Your certificate is ready.
            </p>
          </div>
          <div className="flex gap-3">
            <CertificateButton
              courseId={courseId}
              completed={isCompleted}
              certificateId={certificate?.id ?? null}
            />
            <Link
              href="/dashboard/courses"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50"
            >
              Explore Next Course
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">Course Curriculum</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {curriculum.length} modules · {allTopics.length} lessons ·{" "}
          {formatDuration(allTopics.reduce((s, t) => s + (t.duration_minutes || 0), 0))}
        </p>
        <div className="mt-5">
          {curriculum.length > 0 ? (
            <CourseCurriculum sections={curriculum} courseId={courseId} />
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
              No topics have been added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}