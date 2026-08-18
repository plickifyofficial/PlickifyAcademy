import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { ReviewsSection } from "@/components/courses/reviews-section";
import { QnaSection } from "@/components/courses/qna-section";
import { CertificateButton } from "@/components/courses/certificate-button";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { LiveClassesSection } from "@/components/courses/live-classes-section";
import { Curriculum, type CurSection } from "@/components/courses/curriculum";
import type { Lesson, Announcement, LiveClass } from "@/lib/types";

export const metadata = { title: "কোর্স" };

const LEVEL_LABEL: Record<string, string> = {
  beginner: "বিগিনার",
  intermediate: "ইন্টারমিডিয়েট",
  advanced: "অ্যাডভান্সড",
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
  const totalMinutes = allTopics.reduce(
    (s, t) => s + (t.duration_minutes || 0),
    0,
  );

  const admin = createAdminClient();
  const [{ data: studentsRaw }, { data: instructor }] = await Promise.all([
    admin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id),
    admin
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", course.created_by ?? "")
      .maybeSingle(),
  ]);
  const studentsCount = studentsRaw?.length ?? 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  let enrollmentDate: string | null = null;
  let lastLessonId: string | null = null;
  let isAdmin = false;
  let wishlisted = false;
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

    const { data: wish } = await supabase
      .from("wishlist")
      .select("course_id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    wishlisted = !!wish;

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

  const { data: liveClasses } = await supabase
    .from("live_classes")
    .select("*")
    .eq("course_id", course.id)
    .order("scheduled_at", { ascending: true });

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

  const curriculum: CurSection[] = (sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    items: (topicsBySection[section.id] ?? []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      type: topic.type,
      duration_minutes: topic.duration_minutes,
      is_free: topic.is_free,
      done: completedIds.has(topic.id),
      locked: (!canAccess && !topic.is_free) || isDripLocked(topic),
      drip: isDripLocked(topic),
    })),
  }));

  const whatYouLearn = allTopics.slice(0, 6).map((t) => t.title);

  const includes = [
    "সম্পূর্ণ ভিডিও লেসন",
    "লাইভ ক্লাস ও রেকর্ডিং",
    "প্র্যাকটিক্যাল অ্যাসাইনমেন্ট",
    "সাপ্তাহিক Q&A সেশন",
    "ভেরিফায়েড সার্টিফিকেট",
    "লাইফটাইম অ্যাক্সেস",
  ];

  const durationText =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)} ঘণ্টা ${totalMinutes % 60} মিনিট`
      : `${totalMinutes} মিনিট`;

  const hourMin = (totalMinutes / 60).toFixed(1);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-purple-800 py-10 text-white sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-brand-200">
            <Link href="/" className="transition-colors hover:text-white">
              হোম
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <Link href="/courses" className="transition-colors hover:text-white">
              কোর্সসমূহ
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="truncate text-white/90">{course.title}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {LEVEL_LABEL[course.level ?? ""] ?? "কোর্স"}
                </span>
                {course.price === 0 && (
                  <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-green-950">
                    সম্পূর্ণ ফ্রি
                  </span>
                )}
                {avg > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <span className="text-amber-300">
                      <i className="fa-solid fa-star" />
                    </span>
                    {avg.toFixed(1)}
                    <span className="text-brand-200">({reviews.length} রিভিউ)</span>
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[42px]">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-100">
                {course.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-brand-100">
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-play text-white/60" />
                  {allTopicIds.length}টি লেসন
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-clock text-white/60" />
                  {durationText}
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-user-group text-white/60" />
                  {studentsCount}+ শিক্ষার্থী
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-white/60" />
                  সার্টিফিকেট
                </span>
              </div>

              {isEnrolled && (
                <div className="mt-6 max-w-md">
                  <div className="flex items-center justify-between text-sm text-brand-100">
                    <span>আপনার অগ্রগতি</span>
                    <span className="font-semibold">{progressPct}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-brand-200">
                    {completedCount}/{allTopicIds.length} টপিক সম্পন্ন
                  </p>
                </div>
              )}

              {isEnrolled && instructor?.full_name && (
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                    {instructor.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={instructor.avatar_url}
                        alt={instructor.full_name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      instructor.full_name.charAt(0)
                    )}
                  </span>
                  <div>
                    <p className="text-xs text-brand-200">ইনস্ট্রাক্টর</p>
                    <p className="text-sm font-semibold">{instructor.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-24 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-700 to-purple-800">
                  {course.cover_image ? (
                    <Image
                      src={course.cover_image}
                      alt={course.title}
                      fill
                      priority
                      sizes="360px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl text-white/30">
                      {course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-zinc-900">
                      {formatPrice(course.price)}
                    </span>
                    {course.price > 0 && (
                      <span className="text-sm text-zinc-400 line-through">
                        {formatPrice(Math.round(course.price * 1.5))}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    এককালীন ফি · লাইফটাইম অ্যাক্সেস
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {canAccess ? (
                      resumeTopic ? (
                        <Link
                          href={`/courses/${course.slug}/lessons/${resumeTopic.id}`}
                          className="block rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
                        >
                          <i className="fa-solid fa-play mr-2" />
                          {isEnrolled && lastLessonId
                            ? "শেখা চালিয়ে যান"
                            : "শেখা শুরু করুন"}
                        </Link>
                      ) : (
                        <p className="rounded-xl bg-zinc-100 py-3.5 text-center text-sm font-semibold text-zinc-600">
                          টপিক যোগ করা হয়নি
                        </p>
                      )
                    ) : (
                      <CheckoutButton courseId={course.id} price={course.price} />
                    )}
                  </div>

                  <div className="mt-3">
                    {!isEnrolled && (
                      <WishlistButton courseId={course.id} initialSaved={wishlisted} />
                    )}
                  </div>

                  {isEnrolled && (
                    <div className="mt-4">
                      <CertificateButton
                        courseId={course.id}
                        completed={progressPct === 100}
                        certificateId={certificateId}
                      />
                    </div>
                  )}

                  <div className="mt-6 border-t border-zinc-100 pt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      এই কোর্সে যা পাবেন
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2.5 text-sm text-zinc-700"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50">
                            <i className="fa-solid fa-check text-[10px] text-brand-600" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">লেভেল</span>
                      <span className="font-semibold text-zinc-800">
                        {LEVEL_LABEL[course.level ?? ""] ?? "সব লেভেল"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">লেসন</span>
                      <span className="font-semibold text-zinc-800">
                        {allTopicIds.length}টি
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ডিউরেশন</span>
                      <span className="font-semibold text-zinc-800">
                        {durationText}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">শিক্ষার্থী</span>
                      <span className="font-semibold text-zinc-800">
                        {studentsCount}+
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ভাষা</span>
                      <span className="font-semibold text-zinc-800">বাংলা</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          <div className="min-w-0 space-y-14">
            {whatYouLearn.length > 0 && (
              <section>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <i className="fa-solid fa-lightbulb" />
                  </span>
                  <h2 className="text-2xl font-bold text-zinc-900">
                    শিখবেন যা যা
                  </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {whatYouLearn.map((t) => (
                    <div
                      key={t}
                      className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <i className="fa-solid fa-check text-[10px] text-green-700" />
                      </span>
                      <span className="text-sm font-medium text-zinc-700">
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <i className="fa-solid fa-list-ol" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900">
                      কোর্স কারিকুলাম
                    </h2>
                    <p className="text-sm text-zinc-500">
                      {curriculum.length}টি সেকশন · {allTopicIds.length}টি টপিক ·{" "}
                      {hourMin} ঘণ্টা
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {curriculum.length > 0 ? (
                  <Curriculum sections={curriculum} courseSlug={course.slug} />
                ) : (
                  <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-zinc-500">
                    এখনো কোনো টপিক যোগ করা হয়নি।
                  </p>
                )}
              </div>
            </section>

            {isEnrolled && ((liveClasses ?? []) as LiveClass[]).length > 0 && (
              <section>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <i className="fa-solid fa-calendar-days" />
                  </span>
                  <h2 className="text-2xl font-bold text-zinc-900">
                    লাইভ ক্লাস
                  </h2>
                </div>
                <div className="mt-6">
                  <LiveClassesSection
                    classes={liveClasses as LiveClass[]}
                    isEnrolled={isEnrolled}
                  />
                </div>
              </section>
            )}

            {isEnrolled && (announcements ?? []).length > 0 && (
              <section>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <i className="fa-solid fa-bullhorn" />
                  </span>
                  <h2 className="text-2xl font-bold text-zinc-900">নোটিশ</h2>
                </div>
                <div className="mt-6 space-y-3">
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

            <section>
              <ReviewsSection
                courseId={course.id}
                isEnrolled={isEnrolled}
                reviews={reviews}
                avg={avg}
                count={reviews.length}
                ownReview={ownReview}
              />
            </section>

            <section>
              <QnaSection
                courseId={course.id}
                isEnrolled={isEnrolled}
                isAdmin={isAdmin}
                items={qnaItems}
              />
            </section>
          </div>

          <div className="lg:hidden">
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-brand-100/50 ring-1 ring-zinc-200">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-700 to-purple-800">
                {course.cover_image ? (
                  <Image
                    src={course.cover_image}
                    alt={course.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-white/30">
                    {course.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-zinc-900">
                    {formatPrice(course.price)}
                  </span>
                  {course.price > 0 && (
                    <span className="text-sm text-zinc-400 line-through">
                      {formatPrice(Math.round(course.price * 1.5))}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  এককালীন ফি · লাইফটাইম অ্যাক্সেস
                </p>

                <div className="mt-5 space-y-2.5">
                  {canAccess ? (
                    resumeTopic ? (
                      <Link
                        href={`/courses/${course.slug}/lessons/${resumeTopic.id}`}
                        className="block rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700"
                      >
                        <i className="fa-solid fa-play mr-2" />
                        {isEnrolled && lastLessonId
                          ? "শেখা চালিয়ে যান"
                          : "শেখা শুরু করুন"}
                      </Link>
                    ) : (
                      <p className="rounded-xl bg-zinc-100 py-3.5 text-center text-sm font-semibold text-zinc-600">
                        টপিক যোগ করা হয়নি
                      </p>
                    )
                  ) : (
                    <CheckoutButton courseId={course.id} price={course.price} />
                  )}
                </div>

                <div className="mt-3">
                  {!isEnrolled && (
                    <WishlistButton courseId={course.id} initialSaved={wishlisted} />
                  )}
                </div>

                {isEnrolled && (
                  <div className="mt-4">
                    <CertificateButton
                      courseId={course.id}
                      completed={progressPct === 100}
                      certificateId={certificateId}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}