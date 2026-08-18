import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { getSiteContent } from "@/lib/site-content";
import { coursePageDefaults } from "@/lib/content-schema";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { ReviewsSection } from "@/components/courses/reviews-section";
import { QnaSection } from "@/components/courses/qna-section";
import { CertificateButton } from "@/components/courses/certificate-button";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { LiveClassesSection } from "@/components/courses/live-classes-section";
import { Curriculum, type CurSection } from "@/components/courses/curriculum";
import {
  WhatYouLearn,
  type LearnModule,
} from "@/components/courses/what-you-learn";
import { Faq } from "@/components/home/faq";
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
  const content = await getSiteContent("page.course", coursePageDefaults);

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
      .select("full_name, avatar_url")
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

  const modules: LearnModule[] = (sections ?? []).map((section, i) => ({
    id: section.id,
    position: i + 1,
    title: section.title,
    items: (topicsBySection[section.id] ?? []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      duration_minutes: topic.duration_minutes,
    })),
  }));

  const durationText =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)} ঘণ্টা ${totalMinutes % 60} মিনিট`
      : `${totalMinutes} মিনিট`;

  const originalPrice = course.price > 0 ? course.price * 2 : 0;
  const instructorImage =
    content.instructorImage || instructor?.avatar_url || null;

  const sectionTitle = (icon: string, title: string) => (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
        <i className={icon} />
      </span>
      <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{title}</h2>
    </div>
  );

  return (
    <main className="flex-1">
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-purple-800 pb-16 pt-10 text-white sm:pt-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-brand-200">
            <Link href="/" className="transition-colors hover:text-white">হোম</Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <Link href="/courses" className="transition-colors hover:text-white">কোর্সসমূহ</Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="truncate text-white/90">{course.title}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
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
                    <span className="text-amber-300"><i className="fa-solid fa-star" /></span>
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
                  <i className="fa-solid fa-play text-white/60" /> {allTopicIds.length}টি লেসন
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-clock text-white/60" /> {durationText}
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-user-group text-white/60" /> {studentsCount}+ শিক্ষার্থী
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-white/60" /> সার্টিফিকেট
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
            </div>

            {/* Purchase card */}
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">
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
                  {course.price > 0 && originalPrice > course.price && (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow">
                      {content.discountLabel}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-zinc-900">
                      {formatPrice(course.price)}
                    </span>
                    {course.price > 0 && originalPrice > course.price && (
                      <span className="text-sm text-zinc-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{content.pricingNote}</p>

                  <div className="mt-5 space-y-2.5">
                    {canAccess ? (
                      resumeTopic ? (
                        <Link
                          href={`/courses/${course.slug}/lessons/${resumeTopic.id}`}
                          className="block rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
                        >
                          <i className="fa-solid fa-play mr-2" />
                          {isEnrolled && lastLessonId ? "শেখা চালিয়ে যান" : "শেখা শুরু করুন"}
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

                  <p className="mt-5 flex items-center justify-center gap-2 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-500">
                    <i className="fa-solid fa-shield-halved text-green-600" />
                    {content.secureText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* 2. COURSE HIGHLIGHTS */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" data-aos="fade-up">
          {content.highlights.map((h) => (
            <div
              key={h.title}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
                <i className={h.icon} />
              </span>
              <span className="text-sm font-semibold text-zinc-800">{h.title}</span>
            </div>
          ))}
        </section>

        {/* 3. COURSE DESCRIPTION */}
        {content.description && (
          <section className="mt-14" data-aos="fade-up">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">{sectionTitle("fa-solid fa-circle-info", content.descriptionHeading)}</div>
              <p className="mt-6 text-base leading-relaxed text-zinc-600">
                {content.description}
              </p>
            </div>
          </section>
        )}

        {/* 4. WHAT YOU'LL LEARN */}
        {modules.length > 0 && (
          <section className="mt-16" data-aos="fade-up">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                Modules
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
                What You&apos;ll Learn
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-zinc-600">
                প্রতিটা মডিউলে প্র্যাকটিক্যাল লেসন — ক্লিক করলে ভেতরের লেসন দেখুন।
              </p>
            </div>
            <div className="mt-10">
              <WhatYouLearn modules={modules} />
            </div>
          </section>
        )}

        {/* 5. CURRICULUM */}
        <section className="mt-16" data-aos="fade-up">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Course Curriculum
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              কোর্স কারিকুলাম
            </h2>
            <p className="mt-3 text-zinc-600">
              {curriculum.length}টি মডিউল · {allTopicIds.length}টি লেসন · {durationText}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            {curriculum.length > 0 ? (
              <Curriculum sections={curriculum} courseSlug={course.slug} />
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-zinc-500">
                এখনো কোনো টপিক যোগ করা হয়নি।
              </p>
            )}
          </div>
        </section>

        {isEnrolled && ((liveClasses ?? []) as LiveClass[]).length > 0 && (
          <section className="mt-16" data-aos="fade-up">
            {sectionTitle("fa-solid fa-calendar-days", "লাইভ ক্লাস")}
            <div className="mt-6">
              <LiveClassesSection
                classes={liveClasses as LiveClass[]}
                isEnrolled={isEnrolled}
              />
            </div>
          </section>
        )}

        {isEnrolled && (announcements ?? []).length > 0 && (
          <section className="mt-16" data-aos="fade-up">
            {sectionTitle("fa-solid fa-bullhorn", "নোটিশ")}
            <div className="mt-6 space-y-3">
              {(announcements as Announcement[]).map((a) => (
                <div key={a.id} className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                  <div className="flex items-center gap-2 text-brand-700">
                    <i className="fa-solid fa-bullhorn" />
                    <span className="text-xs font-semibold uppercase tracking-wide">নোটিশ</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(a.created_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-zinc-900">{a.title}</p>
                  {a.body && <p className="mt-1 text-sm text-zinc-600">{a.body}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. WHO IS THIS COURSE FOR */}
        <section className="mt-16" data-aos="fade-up">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Who Is This Course For
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              এই কোর্সটি কার জন্য?
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.whoFor.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-xl text-white shadow-md shadow-brand-600/25">
                  <i className={item.icon} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. COURSE OUTCOME */}
        <section className="mt-16" data-aos="zoom-in">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 px-6 py-14 shadow-2xl shadow-blue-800/30 sm:px-14">
            <span className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <span className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-3xl text-white backdrop-blur">
                <i className="fa-solid fa-rocket" />
              </span>
              <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
                {content.outcomeTitle}
              </h2>
              {content.outcomeSubtitle && (
                <p className="mt-3 text-blue-100">{content.outcomeSubtitle}</p>
              )}

              <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
                {content.outcome.map((o) => (
                  <div
                    key={o}
                    className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-400">
                      <i className="fa-solid fa-check text-xs text-green-950" />
                    </span>
                    <span className="text-sm font-medium text-white">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. INSTRUCTOR */}
        <section className="mt-16" data-aos="fade-up">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">{sectionTitle("fa-solid fa-chalkboard-user", "আপনার ইনস্ট্রাক্টর")}</div>
            <div className="mt-8 flex flex-col items-center gap-6 rounded-2xl border border-zinc-100 bg-white p-8 shadow-sm sm:flex-row sm:gap-8">
              <div className="relative h-28 w-28 shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-600 to-purple-700 text-4xl font-bold text-white shadow-lg shadow-brand-600/30">
                  {instructorImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructorImage}
                      alt={content.instructorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    content.instructorName.charAt(0)
                  )}
                </div>
                <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-white">
                  <i className="fa-solid fa-check text-[10px]" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-zinc-900">{content.instructorName}</h3>
                <p className="mt-1 text-sm font-semibold text-brand-600">{content.instructorRole}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {content.instructorDescription}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
                  {[
                    { icon: "fa-brands fa-facebook-f", href: content.instructorFacebook },
                    { icon: "fa-brands fa-youtube", href: content.instructorYoutube },
                    { icon: "fa-brands fa-linkedin-in", href: content.instructorLinkedin },
                  ].map(
                    (s) =>
                      s.href &&
                      s.href !== "#" && (
                        <a
                          key={s.icon}
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="সোশ্যাল"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-brand-500 hover:bg-brand-600 hover:text-white"
                        >
                          <i className={`${s.icon} text-sm`} />
                        </a>
                      ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. REVIEWS */}
        <section className="mt-16" data-aos="fade-up">
          <ReviewsSection
            courseId={course.id}
            isEnrolled={isEnrolled}
            reviews={reviews}
            avg={avg}
            count={reviews.length}
            ownReview={ownReview}
          />
        </section>

        {/* 9b. Q&A */}
        <section className="mt-16" data-aos="fade-up">
          <QnaSection
            courseId={course.id}
            isEnrolled={isEnrolled}
            isAdmin={isAdmin}
            items={qnaItems}
          />
        </section>

        {/* 10. PRICING CTA */}
        <section id="pricing" className="mt-16 scroll-mt-24" data-aos="zoom-in">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 px-6 py-14 text-center shadow-2xl shadow-brand-700/40 sm:px-14">
            <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <span className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                Limited Time Offer
              </p>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
                {course.title}-এ আজই ভর্তি হন
              </h2>

              <div className="mt-6 flex items-baseline justify-center gap-4">
                {course.price > 0 && originalPrice > course.price && (
                  <span className="text-2xl text-brand-200 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-5xl font-extrabold text-white">
                  {formatPrice(course.price)}
                </span>
              </div>
              <p className="mt-2 text-sm text-brand-100">{content.pricingNote}</p>

              <div className="mt-8 flex justify-center">
                {canAccess ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-lg">
                    <i className="fa-solid fa-circle-check text-green-600" />
                    আপনি ইতিমধ্যে ভর্তি হয়েছেন
                  </span>
                ) : (
                  <a
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
                  >
                    ভর্তি হন
                    <i className="fa-solid fa-arrow-right text-sm" />
                  </a>
                )}
              </div>

              <p className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-brand-100">
                <i className="fa-solid fa-shield-halved text-green-300" />
                {content.secureText}
              </p>
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        {content.faqItems.length > 0 && (
          <section className="mt-16" data-aos="fade-up">
            <Faq content={{ title: content.faqTitle, items: content.faqItems }} />
          </section>
        )}

        {/* 12. FINAL CTA */}
        <section className="mt-16 pb-4" data-aos="zoom-in">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-900 px-8 py-14 text-center shadow-2xl shadow-brand-900/40 sm:px-14">
            <span className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
            <span className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                আপনার AI &amp; Digital Income Journey আজই শুরু করুন 🚀
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-300">
                সিট সংখ্যা সীমিত — আজই ভর্তি হয়ে আপনার ডিজিটাল ক্যারিয়ার শুরু করুন।
              </p>
              <a
                href="#pricing"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/40 transition-all hover:-translate-y-0.5 hover:bg-brand-500"
              >
                Enroll Now
                <i className="fa-solid fa-arrow-right text-sm" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}