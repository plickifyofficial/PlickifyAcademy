"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { removeFromWishlist } from "@/lib/actions/learning";
import { formatPrice } from "@/lib/format";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  price: number;
};

export function WishlistCard({ course }: { course: Course }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [removed, setRemoved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    setPending(true);
    try {
      await removeFromWishlist(course.id);
      setRemoved(true);
      router.refresh();
    } catch (e) {
      showToast((e as Error).message, "error");
      setPending(false);
    }
  }

  if (removed) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md">
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-brand-500 to-purple-600 text-4xl font-bold text-white">
        {course.title.charAt(0)}
        <button
          onClick={handleRemove}
          disabled={pending}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow hover:bg-white"
          aria-label="মুছে ফেলুন"
        >
          <i className="fa-solid fa-trash-can text-sm" />
        </button>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-zinc-900">{course.title}</h3>
        {course.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
            {course.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">
            {formatPrice(course.price)}
          </span>
          <Link
            href={`/courses/${course.slug}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
}