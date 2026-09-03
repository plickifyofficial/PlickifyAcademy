"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { formatPrice } from "@/lib/format";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { CertificateButton } from "@/components/courses/certificate-button";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { PromoVideo } from "@/components/courses/promo-video";

interface CourseUserSectionProps {
  courseId: string;
  courseSlug: string;
  coursePrice: number;
  originalPrice: number;
  allTopicIds: string[];
  discountLabel: string;
  pricingNote: string;
  secureText: string;
  coverImage: string | null;
  promoVideoUrl: string | null;
  promoVideoEmbed: string | null;
  title: string;
}

export function CourseUserSection({
  courseId,
  courseSlug,
  coursePrice,
  originalPrice,
  allTopicIds,
  discountLabel,
  pricingNote,
  secureText,
  coverImage,
  promoVideoUrl,
  promoVideoEmbed,
  title,
}: CourseUserSectionProps) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState<string | null>(null);
  const [lastLessonId, setLastLessonId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [ownReview, setOwnReview] = useState<{ rating: number; comment: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const [{ data: profile }, { data: wish }, { data: enrollment }, { data: state }, { data: review }, { data: cert }] = await Promise.all([
          supabase.from("profiles").select("role").eq("id", authUser.id).maybeSingle(),
          supabase.from("wishlist").select("course_id").eq("user_id", authUser.id).eq("course_id", courseId).maybeSingle(),
          supabase.from("enrollments").select("id, created_at").eq("user_id", authUser.id).eq("course_id", courseId).maybeSingle(),
          supabase.from("user_course_state").select("last_lesson_id").eq("user_id", authUser.id).eq("course_id", courseId).maybeSingle(),
          supabase.from("reviews").select("rating, comment").eq("user_id", authUser.id).eq("course_id", courseId).maybeSingle(),
          supabase.from("certificates").select("id").eq("user_id", authUser.id).eq("course_id", courseId).maybeSingle(),
        ]);

        setIsAdmin(profile?.role === "admin");
        setWishlisted(!!wish);
        setIsEnrolled(!!enrollment);
        setEnrollmentDate(enrollment?.created_at ?? null);
        setLastLessonId(state?.last_lesson_id ?? null);
        setOwnReview(review ?? null);
        setCertificateId(cert?.id ?? null);

        if (enrollment && allTopicIds.length > 0) {
          const { data: progress } = await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .in("lesson_id", allTopicIds)
            .eq("user_id", authUser.id);
          setCompletedIds(new Set((progress ?? []).map((p) => p.lesson_id)));
        }
      }
      setLoading(false);
    }

    load();
  }, [courseId, allTopicIds]);

  function isDripLocked(topicReleaseDays: number | null | undefined): boolean {
    if (!isEnrolled || !topicReleaseDays || topicReleaseDays <= 0 || !enrollmentDate) return false;
    const unlock = new Date(new Date(enrollmentDate).getTime() + topicReleaseDays * 86400000);
    return new Date() < unlock;
  }

  const completedCount = allTopicIds.filter((id) => completedIds.has(id)).length;
  const progressPct = allTopicIds.length > 0 ? Math.round((completedCount / allTopicIds.length) * 100) : 0;
  const canAccess = isEnrolled;

  const resumeTopicId = lastLessonId ?? null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">
      <div className="relative overflow-hidden rounded-t-2xl">
        <PromoVideo
          coverImage={coverImage}
          title={title}
          url={promoVideoUrl}
          embed={promoVideoEmbed}
        />
        {coursePrice > 0 && originalPrice > coursePrice && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow">
            {discountLabel}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-zinc-900">
            {formatPrice(coursePrice)}
          </span>
          {coursePrice > 0 && originalPrice > coursePrice && (
            <span className="text-sm text-zinc-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500">{pricingNote}</p>

        {isEnrolled && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Your Progress</span>
              <span className="font-semibold">{progressPct}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              {completedCount}/{allTopicIds.length} topics completed
            </p>
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          {loading ? (
            <div className="h-12 animate-pulse rounded-xl bg-zinc-100" />
          ) : canAccess ? (
            resumeTopicId ? (
              <Link
                href={`/courses/${courseSlug}/lessons/${resumeTopicId}`}
                className="block rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
              >
                <i className="fa-solid fa-play mr-2" />
                {lastLessonId ? "Continue Learning" : "Start Learning"}
              </Link>
            ) : (
              <p className="rounded-xl bg-zinc-100 py-3.5 text-center text-sm font-semibold text-zinc-600">
                No topics added yet
              </p>
            )
          ) : (
            <CheckoutButton courseId={courseId} price={coursePrice} />
          )}
        </div>

        <div className="mt-3">
          {!loading && !isEnrolled && (
            <WishlistButton courseId={courseId} initialSaved={wishlisted} />
          )}
        </div>

        {isEnrolled && (
          <div className="mt-4">
            <CertificateButton
              courseId={courseId}
              completed={progressPct === 100}
              certificateId={certificateId}
            />
          </div>
        )}

        <p className="mt-5 flex items-center justify-center gap-2 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-500">
          <i className="fa-solid fa-shield-halved text-green-600" />
          {secureText}
        </p>
      </div>
    </div>
  );
}
