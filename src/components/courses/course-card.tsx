import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Course } from "@/lib/types";

export function CourseCard({
  course,
  rating,
  reviewCount,
}: {
  course: Course;
  rating?: number;
  reviewCount?: number;
}) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative h-44 w-full bg-gradient-to-br from-brand-500 to-purple-600">
        {course.cover_image ? (
          <Image
            src={course.cover_image}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-white/40">
            {course.title.charAt(0)}
          </div>
        )}
        {course.price === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            ফ্রি
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-brand-600">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
          {course.description}
        </p>
        <div className="mt-3 flex items-center gap-1 text-sm">
          <span className="font-bold text-amber-400">
            <i className="fa-solid fa-star" />
          </span>
          <span className="font-semibold text-zinc-800">
            {rating && rating > 0 ? rating.toFixed(1) : "নতুন"}
          </span>
          {rating && rating > 0 && (
            <span className="text-xs text-zinc-500">
              ({reviewCount ?? 0})
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-600">
            {formatPrice(course.price)}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium capitalize text-zinc-600">
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  );
}
