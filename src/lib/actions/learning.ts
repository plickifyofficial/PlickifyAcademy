"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { QuizQuestion } from "@/lib/types";
import { createNotification } from "@/lib/actions/notifications";

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
  if (!lesson) throw new Error("Quiz not found");

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
  courseId: string,
): Promise<string> {
  const { data } = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .single();
  return data?.slug ?? "";
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

export async function submitReview(
  courseId: string,
  rating: number,
  comment: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (rating < 1 || rating > 5) throw new Error("Please provide a rating between 1-5");

  const { error } = await supabase.from("reviews").upsert(
    {
      course_id: courseId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    },
    { onConflict: "course_id, user_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/courses/${await courseSlug(supabase, courseId)}`);
}

export async function askQuestion(courseId: string, question: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!question.trim()) throw new Error("Please write a question");

  const { error } = await supabase.from("course_qna").insert({
    course_id: courseId,
    user_id: user.id,
    question: question.trim(),
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/courses/${await courseSlug(supabase, courseId)}`);
}

export async function answerQuestion(qnaId: string, answer: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!answer.trim()) throw new Error("Please write an answer");

  const { data: qna } = await supabase
    .from("course_qna")
    .select("course_id, user_id")
    .eq("id", qnaId)
    .single();
  if (!qna) throw new Error("Question not found");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && qna.user_id !== user.id)
    throw new Error("Only the question author or an admin can answer");

  const { error } = await supabase
    .from("course_qna")
    .update({
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
    })
    .eq("id", qnaId);
  if (error) throw new Error(error.message);

  if (qna.user_id !== user.id) {
    await createNotification(
      qna.user_id,
      "Your question has an answer ✅",
      "Your question was answered in the course Q&A.",
      `/courses/${await courseSlug(supabase, qna.course_id)}#qna`,
    );
  }

  revalidatePath(`/courses/${await courseSlug(supabase, qna.course_id)}`);
}

export async function issueCertificate(
  courseId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("issue_certificate", {
    p_course_id: courseId,
  });
  if (error) throw new Error(error.message);

  if (data) {
    await createNotification(
      user.id,
      "Certificate ready 🎓",
      "Congratulations on completing the course! Download your certificate.",
      `/certificates/${data}`,
    );
  }

  revalidatePath(`/courses/${await courseSlug(supabase, courseId)}`);
  revalidatePath("/dashboard");

  return data as string | null;
}

export async function toggleWishlist(courseId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("wishlist")
    .select("course_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  let saved = false;
  if (existing) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", courseId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("wishlist").insert({
      user_id: user.id,
      course_id: courseId,
    });
    if (error) throw new Error(error.message);
    saved = true;
  }

  revalidatePath(`/courses/${await courseSlug(supabase, courseId)}`);
  return saved;
}

export async function removeFromWishlist(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("course_id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/wishlist");
}