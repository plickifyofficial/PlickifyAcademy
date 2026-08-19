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

export type ProgressUpdateInput = {
  lessonId: string;
  positionSeconds?: number;
  watchedDelta?: number;
  complete?: boolean;
};

export async function updateLessonProgress(input: ProgressUpdateInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, course_id, duration_minutes, completion_rule, completion_percent")
    .eq("id", input.lessonId)
    .single();
  if (!lesson) throw new Error("Lesson not found");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", lesson.course_id)
    .maybeSingle();
  if (!enrollment) throw new Error("Not enrolled");

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("completed, completed_at, video_watch_seconds")
    .eq("user_id", user.id)
    .eq("lesson_id", input.lessonId)
    .maybeSingle();

  const alreadyDone = existing?.completed === true;
  const watchedSeconds =
    (existing?.video_watch_seconds ?? 0) + (input.watchedDelta ?? 0);

  const durationSeconds = (lesson.duration_minutes ?? 0) * 60;
  const autoComplete =
    lesson.completion_rule === "video_percent" &&
    durationSeconds > 0 &&
    watchedSeconds >= (durationSeconds * (lesson.completion_percent ?? 80)) / 100;

  const complete = alreadyDone || input.complete === true || autoComplete;

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: input.lessonId,
      completed: complete,
      completed_at: complete && !alreadyDone ? new Date().toISOString() : existing?.completed_at ?? null,
      position_seconds: input.positionSeconds ?? undefined,
      video_watch_seconds: watchedSeconds,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id, lesson_id" },
  );

  await supabase.from("user_course_state").upsert(
    {
      user_id: user.id,
      course_id: lesson.course_id,
      last_lesson_id: input.lessonId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id, course_id" },
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/courses/${lesson.course_id}`);
  revalidatePath(`/dashboard/learn/${lesson.course_id}/${input.lessonId}`);

  return {
    completed: complete,
    autoCompleted: autoComplete && !alreadyDone,
    watchedSeconds,
    positionSeconds: input.positionSeconds ?? 0,
  };
}

export async function saveLessonNote(lessonId: string, note: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("lesson_notes").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      note: note.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id, lesson_id" },
  );
  if (error) throw new Error(error.message);
}

export async function addLessonComment(lessonId: string, comment: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!comment.trim()) throw new Error("Please write a comment");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();
  if (!lesson) throw new Error("Lesson not found");

  const { error } = await supabase.from("lesson_comments").insert({
    lesson_id: lessonId,
    user_id: user.id,
    comment: comment.trim(),
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/learn/${lesson.course_id}/${lessonId}`);
  revalidatePath("/dashboard");
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

export async function submitAssignment(lessonId: string, text: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, course_id, total_points")
    .eq("lesson_id", lessonId)
    .single();
  if (!assignment) throw new Error("Assignment not found");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", assignment.course_id)
    .maybeSingle();
  if (!enrollment) throw new Error("Not enrolled");

  const { data: existing } = await supabase
    .from("assignment_submissions")
    .select("id, grade, submitted_at")
    .eq("assignment_id", assignment.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.grade != null) {
    throw new Error("This assignment has already been graded.");
  }

  const { error } = await supabase.from("assignment_submissions").upsert(
    {
      id: existing?.id,
      assignment_id: assignment.id,
      lesson_id: lessonId,
      user_id: user.id,
      submission_text: text.trim(),
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id, user_id" },
  );
  if (error) throw new Error(error.message);

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id, lesson_id" },
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/assignments");
  revalidatePath(`/dashboard/learn/${assignment.course_id}/${lessonId}`);
}