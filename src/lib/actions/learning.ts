"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { QuizQuestion } from "@/lib/types";

export type QuizResult = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  details: {
    question: string;
    chosen: number;
    correct: number;
    isCorrect: boolean;
    explanation: string | null;
  }[];
};

export async function submitQuiz(
  lessonId: string,
  answers: Record<string, number>,
): Promise<QuizResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("pass_percent")
    .eq("id", lessonId)
    .single();
  if (!lesson) throw new Error("কুইজ পাওয়া যায়নি");

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true });

  const list = (questions ?? []) as unknown as QuizQuestion[];
  let score = 0;
  const details = list.map((q) => {
    const chosen = answers[q.id] ?? -1;
    const isCorrect = chosen === q.correct_index;
    if (isCorrect) score += 1;
    return {
      question: q.question,
      chosen,
      correct: q.correct_index,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const total = list.length;
  const passPercent = lesson.pass_percent ?? 60;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = total > 0 && percent >= passPercent;

  const { error: aerr } = await supabase.from("quiz_attempts").insert({
    lesson_id: lessonId,
    user_id: user.id,
    score,
    total,
    passed,
    answers: answers as unknown as Record<string, unknown>,
  });
  if (aerr) throw new Error(aerr.message);

  if (passed) {
    const { error: perr } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id, lesson_id" },
      );
    if (perr) throw new Error(perr.message);
  }

  revalidatePath(`/courses/${await courseSlug(supabase, lessonId)}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");

  return { score, total, percent, passed, passPercent, details };
}

async function courseSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lessonId: string,
): Promise<string> {
  const { data } = await supabase
    .from("lessons")
    .select("course_id, courses(slug)")
    .eq("id", lessonId)
    .single();
  return (data?.courses as unknown as { slug?: string } | null)?.slug ?? "";
}

export async function updateCourseState(courseId: string, lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_course_state").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      last_lesson_id: lessonId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id, course_id" },
  );
}