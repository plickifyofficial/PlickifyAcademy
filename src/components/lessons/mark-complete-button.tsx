"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  lessonId: string;
  courseSlug: string;
  nextLessonId: string | null;
  isAuthenticated: boolean;
};

export function MarkCompleteButton({
  lessonId,
  courseSlug,
  nextLessonId,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!isAuthenticated) return null;

  async function handleComplete() {
    setPending(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) throw new Error("progress save failed");
      router.refresh();
      if (nextLessonId) {
        router.push(`/courses/${courseSlug}/lessons/${nextLessonId}`);
      }
    } catch {
      // keep button usable if the request fails
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={pending}
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? "সেভ হচ্ছে..." : "লেসন সম্পন্ন করুন"}
    </button>
  );
}
