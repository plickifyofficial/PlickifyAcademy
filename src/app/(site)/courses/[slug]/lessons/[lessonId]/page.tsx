import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkCompleteButton } from "@/components/lessons/mark-complete-button";

export const metadata = { title: "à¦²à§‡à¦¸à¦¨" };

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

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order")
    .eq("course_id", course.id)
    .order("order", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const canAccess = isEnrolled || lesson.is_free || course.price === 0;

  if (!canAccess) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">
          à¦…à§à¦¯à¦¾à¦•à§à¦¸à§‡à¦¸ à¦¨à§‡à¦‡ <i className="fa-solid fa-lock" />
        </h1>
        <p className="mt-3 text-zinc-600">
          à¦à¦‡ à¦²à§‡à¦¸à¦¨à¦Ÿà¦¿ à¦¦à§‡à¦–à¦¤à§‡ à¦¹à¦²à§‡ à¦•à§‹à¦°à§à¦¸à¦Ÿà¦¿ à¦•à¦¿à¦¨à¦¤à§‡ à¦¹à¦¬à§‡à¥¤{" "}
          {course.price === 0 ? (
            "à¦•à§‹à¦°à§à¦¸à¦Ÿà¦¿ à¦«à§à¦°à¦¿, à¦²à¦—à¦‡à¦¨ à¦•à¦°à§‡ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨à¥¤"
          ) : (
            <>à¦•à§‹à¦°à§à¦¸à§‡à¦° à¦¦à¦¾à¦® {course.price} à¦Ÿà¦¾à¦•à¦¾à¥¤</>
          )}
        </p>
        <Link
          href={`/courses/${course.slug}`}
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          à¦•à§‹à¦°à§à¦¸ à¦ªà§‡à¦œà§‡ à¦«à¦¿à¦°à§‡ à¦¯à¦¾à¦¨
        </Link>
      </main>
    );
  }

  const idx = allLessons?.findIndex((l) => l.id === lesson.id) ?? 0;
  const prevLesson = idx > 0 ? allLessons?.[idx - 1] : null;
  const nextLesson = allLessons && idx < allLessons.length - 1 ? allLessons?.[idx + 1] : null;

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-10">
      <Link
        href={`/courses/${course.slug}`}
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        â† {course.title}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-zinc-900">{lesson.title}</h1>

      {lesson.video_url && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-black">
          <video
            src={lesson.video_url}
            controls
            className="aspect-video w-full"
            poster={course.cover_image ?? undefined}
          />
        </div>
      )}

      {lesson.content && (
        <div className="prose prose-zinc mt-8 max-w-none">
          <div className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
            {lesson.content}
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        {prevLesson ? (
          <Link
            href={`/courses/${course.slug}/lessons/${prevLesson.id}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            â† à¦†à¦—à§‡à¦° à¦²à§‡à¦¸à¦¨
          </Link>
        ) : (
          <span />
        )}

        <MarkCompleteButton
          lessonId={lesson.id}
          courseSlug={course.slug}
          nextLessonId={nextLesson?.id ?? null}
          isAuthenticated={!!user}
        />

        {nextLesson && (
          <Link
            href={`/courses/${course.slug}/lessons/${nextLesson.id}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            à¦ªà¦°à§‡à¦° à¦²à§‡à¦¸à¦¨ â†’
          </Link>
        )}
      </div>
    </main>
  );
}
