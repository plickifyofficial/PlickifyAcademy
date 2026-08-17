import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { ReviewsSection } from "@/components/courses/reviews-section";
import { QnaSection } from "@/components/courses/qna-section";
import { CertificateButton } from "@/components/courses/certificate-button";
import type { Lesson, Announcement } from "@/lib/types";

export const metadata = { title: "কোর্স" };

const TYPE_META: Record<Lesson["type"], { icon: string }> = {
  lesson: { icon: "fa-solid fa-book-open" },
  video: { icon: "fa-solid fa-video" },
  quiz: { icon: "fa-solid fa-circle-question" },
  assignment: { icon: "fa-solid fa-clipboard-check" },
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) {
    notFound();
  }

  const { data: sections } = await supabase
    .from("course_sections")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const { data: topics } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("order", { ascending: true });

  const topicsBySection: Record<string, Lesson[]> = {};
  for (const topic of topics ?? []) {
    if (topic.section_id) {
      if (topicsBySection[topic.section_id]) {
        topicsBySection[topic.section_id].push(topic);
      } else {
        topicsBySection[topic.section_id] = [topic];
      }
    }
  }

  const allTopics = (topics ?? []).filter((t) => t.section_id);
  const allTopicIds = allTopics.map((t) => t.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  let enrollmentDate: string | null = null;
  let lastLessonId: string | null = null;
  let isAdmin = false;
  let completedIds = new Set<string>();
  let ownReview: { rating: number; comment: string | null } | null = null;
  let certificateId: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
    enrollmentDate = enrollment?.created_at ?? null;

    const { data: state } = await supabase
      .from("user_course_state")
      .select("last_lesson_id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    lastLessonId = state?.last_lesson_id ?? null;

    const { data: review } = await supabase
      .from("reviews")
      .select("rating, comment")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    ownReview = review ?? null;

    const { data: cert } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    certificateId = cert?.id ?? null;

    if (isEnrolled && allTopicIds.length > 0) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .in("lesson_id", allTopicIds)
        .eq("user_id", user.id);
      completedIds = new Set((progress ?? []).map((p) => p.lesson_id));
    }
  }

  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("course_id", course.id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsRaw ?? []) as unknown as {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: { full_name: string | null } | null;
  }[];
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const { data: qnaRaw } = await supabase
    .from("course_qna")
    .select("*, profiles(full_name)")
    .eq("course_id", course.id)
    .order("created_at", { ascending: true });

  const qnaItems = (qnaRaw ?? []) as unknown as {
    id: string;
    question: string;
    answer: string | null;
    answered_at: string | null;
    created_at: string;
    profiles: { full_name: string | null } | null;
  }[];

  const { data: announcements } = await supabase
    .from("course_announcements")
    .select("*")
    .eq("course_id", course.id)
    .order("created_at", { ascending: false });

  function isDripLocked(topic: Lesson): boolean {
    if (!isEnrolled || topic.is_free || (topic.release_days ?? 0) <= 0 || !enrollmentDate)
      return false;
    const unlock = new Date(new Date(enrollmentDate).getTime() + topic.release_days * 86400000);
    return new Date() < unlock;
  }

  const completedCount = allTopicIds.filter((id) => completedIds.has(id)).length;
  const progressPct =
    allTopicIds.length > 0
      ? Math.round((completedCount / allTopicIds.length) * 100)
      : 0;

  const isFree = course.price === 0;
  const canAccess = isEnrolled || isFree;
  const firstTopic = allTopics[0];
  const resumeTopic =
    allTopics.find((t) => t.id === lastLessonId) ?? firstTopic;

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-br from-brand-600 to-purple-700 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium capitalize">
            {course.level}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-100">
            {course.description}
          </p>

          {isEnrolled && (
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-sm text-brand-100">
                <span>অগ্রগতি</span>
                <span className="font-semibold">{progressPct}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-brand-100">
                {completedCount}/{allTopicIds.length} টপিক সম্পন্ন
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <span className="text-3xl font-bold">
              {formatPrice(course.price)}
            </span>
            <span className="text-sm text-brand-200">
              {allTopicIds.length} টি টপিক
            </span>
            {canAccess ? (
              resumeTopic ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${resumeTopic.id}`}
                  className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {isEnrolled && lastLessonId ? "শেখা চালিয়ে যান" : "শেখা শুরু করুন"} →
                </Link>
              ) : null
            ) : (
              <CheckoutButton courseId={course.id} price={course.price} />
            )}
            {isEnrolled && (
              <CertificateButton
                courseId={course.id}
                completed={progressPct === 100}
                certificateId={certificateId}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-zinc-900">
          কোর্স কারিকুলাম
        </h2>
        <div className="mt-6 space-y-6">
          {(sections ?? []).length > 0 ? (
            (sections ?? []).map((section, sIdx) => {
              const sectionTopics = topicsBySection[section.id] ?? [];
              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-3">
                    <h3 className="flex items-center gap-3 font-semibold text-zinc-900">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {sIdx + 1}
                      </span>
                      {section.title}
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {sectionTopics.length} টি টপিক
                    </span>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {sectionTopics.map((topic, idx) => {
                      const locked = (!canAccess && !topic.is_free) || isDripLocked(topic);
                      const drip = isDripLocked(topic);
                      const done = completedIds.has(topic.id);
                      return (
                        <div
                          key={topic.id}
                          className="flex items-center gap-4 px-5 py-3.5"
                        >
                          {done ? (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                              <i className="fa-solid fa-check text-xs" />
                            </span>
                          ) : (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                              {idx + 1}
                            </span>
                          )}
                          <span className="w-4 text-zinc-400">
                            <i
                              className={`${TYPE_META[topic.type].icon} text-sm`}
                            />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-zinc-900">
                              {topic.title}
                            </p>
                            {topic.duration_minutes > 0 && (
                              <p className="text-sm text-zinc-500">
                                {topic.duration_minutes} মিনিট
                              </p>
                            )}
                          </div>
                          {topic.is_free && (
                            <span className="hidden rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:inline">
                              ফ্রি প্রিভিউ
                            </span>
                          )}
                          {locked ? (
                            <span
                              className="text-zinc-400"
                              title={drip ? "ড্রিপ কনটেন্ট — পরে আনলক হবে" : "এনরোল করুন"}
                            >
                              <i className="fa-solid fa-lock" />
                            </span>
                          ) : (
                            <Link
                              href={`/courses/${course.slug}/lessons/${topic.id}`}
                              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                            >
                              দেখুন
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-zinc-500">
              এখনো কোনো টপিক যোগ করা হয়নি।
            </p>
          )}
        </div>
      </section>

      {isEnrolled && (announcements ?? []).length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="space-y-3">
            {(announcements as Announcement[]).map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5"
              >
                <div className="flex items-center gap-2 text-brand-700">
                  <i className="fa-solid fa-bullhorn" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    নোটিশ
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(a.created_at).toLocaleDateString("bn-BD")}
                  </span>
                </div>
                <p className="mt-1.5 font-semibold text-zinc-900">{a.title}</p>
                {a.body && (
                  <p className="mt-1 text-sm text-zinc-600">{a.body}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <ReviewsSection
          courseId={course.id}
          isEnrolled={isEnrolled}
          reviews={reviews}
          avg={avg}
          count={reviews.length}
          ownReview={ownReview}
        />

        <QnaSection
          courseId={course.id}
          isEnrolled={isEnrolled}
          isAdmin={isAdmin}
          items={qnaItems}
        />
      </section>
    </main>
  );
}