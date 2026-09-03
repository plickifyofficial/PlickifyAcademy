import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { getSiteContent } from "@/lib/site-content";
import {
  coursePageDefaults,
  type CoursePageContent,
} from "@/lib/content-schema";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { ReviewsSection } from "@/components/courses/reviews-section";
import { QnaSection } from "@/components/courses/qna-section";
import { CertificateButton } from "@/components/courses/certificate-button";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { LiveClassesSection } from "@/components/courses/live-classes-section";
import { PromoVideo } from "@/components/courses/promo-video";
import { Curriculum, type CurSection } from "@/components/courses/curriculum";
import {
  WhatYouLearn,
  type LearnModule,
} from "@/components/courses/what-you-learn";
import { Faq } from "@/components/home/faq";
import { ProseContent } from "@/components/editor/prose-content";
import { renderContent, toPlainTextMd } from "@/lib/rte";
import type { Lesson, Announcement, LiveClass } from "@/lib/types";
import { CourseUserSection } from "@/components/courses/course-user-section";

export const metadata = { title: "Course" };
export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("courses")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const [courseResult, globalContent] = await Promise.all([
    supabase.from("courses").select("*").eq("slug", slug).eq("is_published", true).single(),
    getSiteContent("page.course", coursePageDefaults),
  ]);

  const course = courseResult.data;

  if (!course) {
    notFound();
  }

  const storedContent =
    course.content && typeof course.content === "object" && !Array.isArray(course.content)
      ? (course.content as Record<string, unknown>)
      : {};
  const content = {
    ...globalContent,
    ...storedContent,
  } as CoursePageContent;

  const [
    { data: sections },
    { data: topics },
    { data: studentsRaw },
    { data: instructor },
    { data: reviewsRaw },
    { data: qnaRaw },
    { data: announcements },
    { data: liveClasses },
  ] = await Promise.all([
    supabase.from("course_sections").select("*").eq("course_id", course.id).order("position", { ascending: true }),
    supabase.from("lessons").select("*").eq("course_id", course.id).order("order", { ascending: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("course_id", course.id),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", course.created_by ?? "").maybeSingle(),
    supabase.from("reviews").select("*, profiles(full_name)").eq("course_id", course.id).order("created_at", { ascending: false }),
    supabase.from("course_qna").select("*, profiles(full_name)").eq("course_id", course.id).order("created_at", { ascending: true }),
    supabase.from("course_announcements").select("*").eq("course_id", course.id).order("created_at", { ascending: false }),
    supabase.from("live_classes").select("*").eq("course_id", course.id).order("scheduled_at", { ascending: true }),
  ]);

  const studentsCount = studentsRaw?.length ?? 0;

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

  const qnaItems = (qnaRaw ?? []) as unknown as {
    id: string;
    question: string;
    answer: string | null;
    answered_at: string | null;
    created_at: string;
    profiles: { full_name: string | null } | null;
  }[];

  const curriculum: CurSection[] = (sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    items: (topicsBySection[section.id] ?? []).map((topic) => ({
      id: topic.id,
      title: topic.title,
      type: topic.type,
      duration_minutes: topic.duration_minutes,
      is_free: topic.is_free,
      done: false,
      locked: true,
      drip: false,
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
      ? `${Math.floor(totalMinutes / 60)} hours ${totalMinutes % 60} min`
      : `${totalMinutes} min`;

  const originalPrice =
    (course.original_price ?? 0) > course.price
      ? course.original_price
      : course.price > 0
        ? course.price * 2
        : 0;

  const courseHeroExcerpt = course.description
    ? toPlainTextMd(course.description).slice(0, 200)
    : "";
  const courseDescription =
    course.description?.trim() || content.description || "";
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
    <main className="flex-1 pb-24 lg:pb-0">
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-purple-800 pb-16 pt-10 text-white sm:pt-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-brand-200">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <Link href="/courses" className="transition-colors hover:text-white">Courses</Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="truncate text-white/90">{course.title}</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {LEVEL_LABEL[course.level ?? ""] ?? "Course"}
                </span>
                {course.price === 0 && (
                  <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-green-950">
                    100% Free
                  </span>
                )}
                {avg > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <span className="text-amber-300"><i className="fa-solid fa-star" /></span>
                    {avg.toFixed(1)}
                    <span className="text-brand-200">({reviews.length} reviews)</span>
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[42px]">
                {course.title}
              </h1>
              {course.subtitle && (
                <p className="mt-4 text-base font-semibold text-amber-300">
                  {course.subtitle}
                </p>
              )}
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-100">
                {courseHeroExcerpt}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-brand-100">
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-play text-white/60" /> {allTopicIds.length} lessons
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-clock text-white/60" /> {durationText}
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-user-group text-white/60" /> {studentsCount}+ students
                </span>
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-white/60" /> Certificate
                </span>
              </div>
            </div>

            {/* Purchase card */}
            <div className="lg:sticky lg:top-24">
              <CourseUserSection
                courseId={course.id}
                courseSlug={course.slug}
                coursePrice={course.price}
                originalPrice={originalPrice}
                allTopicIds={allTopicIds}
                discountLabel={content.discountLabel}
                pricingNote={content.pricingNote}
                secureText={content.secureText}
                coverImage={course.cover_image}
                promoVideoUrl={course.promo_video_url}
                promoVideoEmbed={course.promo_video_embed}
                title={course.title}
              />
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
        {courseDescription && (
          <section className="mt-14" data-aos="fade-up">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">{sectionTitle("fa-solid fa-circle-info", content.descriptionHeading)}</div>
              <ProseContent html={renderContent(courseDescription)} className="mt-6" />
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
                Practical lessons in every module — click to see the lessons inside.
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
              Course Curriculum
            </h2>
            <p className="mt-3 text-zinc-600">
              {curriculum.length} modules · {allTopicIds.length} lessons · {durationText}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            {curriculum.length > 0 ? (
              <Curriculum sections={curriculum} courseSlug={course.slug} />
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-zinc-500">
                No topics have been added yet.
              </p>
            )}
          </div>
        </section>

        {((liveClasses ?? []) as LiveClass[]).length > 0 && (
          <section className="mt-16" data-aos="fade-up">
            {sectionTitle("fa-solid fa-calendar-days", "Live Classes")}
            <div className="mt-6">
              <LiveClassesSection
                classes={liveClasses as LiveClass[]}
                isEnrolled={false}
              />
            </div>
          </section>
        )}

        {(announcements ?? []).length > 0 && (
          <section className="mt-16" data-aos="fade-up">
            {sectionTitle("fa-solid fa-bullhorn", "Announcements")}
            <div className="mt-6 space-y-3">
              {(announcements as Announcement[]).map((a) => (
                <div key={a.id} className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                  <div className="flex items-center gap-2 text-brand-700">
                    <i className="fa-solid fa-bullhorn" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Announcement</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(a.created_at).toLocaleDateString("en-US")}
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
              Who Is This Course For?
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
            <div className="text-center">{sectionTitle("fa-solid fa-chalkboard-user", "Your Instructor")}</div>
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
                          aria-label="Social"
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
            isEnrolled={false}
            reviews={reviews}
            avg={avg}
            count={reviews.length}
            ownReview={null}
          />
        </section>

        {/* 9b. Q&A */}
        <section className="mt-16" data-aos="fade-up">
          <QnaSection
            courseId={course.id}
            isEnrolled={false}
            isAdmin={false}
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
                Enroll in {course.title} today
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
                <a
                  href={`/checkout/${course.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
                >
                  Enroll Now
                  <i className="fa-solid fa-arrow-right text-sm" />
                </a>
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
                {content.ctaTitle}
              </h2>
              {content.ctaSubtitle && (
                <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-300">
                  {content.ctaSubtitle}
                </p>
              )}
              <a
                href="#pricing"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/40 transition-all hover:-translate-y-0.5 hover:bg-brand-500"
              >
                {content.ctaButtonText}
                <i className="fa-solid fa-arrow-right text-sm" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden" data-floating-obstacle>
        <div className="safe-bottom mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-zinc-900">
                {formatPrice(course.price)}
              </span>
              {course.price > 0 && originalPrice > course.price && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-zinc-500">{course.title}</p>
          </div>
          <Link
            href={`/checkout/${course.id}`}
            className="flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
          >
            Enroll Now
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </main>
  );
}