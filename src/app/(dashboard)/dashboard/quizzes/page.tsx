import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuizList, type QuizListItem } from "@/lib/student";
import { cn } from "@/lib/utils";

export const metadata = { title: "Quizzes" };

function scoreLabel(item: QuizListItem): string {
  if (item.bestScore == null) return "Not attempted";
  return `${item.bestScore}/${item.totalQuestions}`;
}

export default async function QuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quizzes = await getQuizList(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Quizzes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Practice quizzes across your enrolled courses.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-circle-question" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">No quizzes yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Quizzes from your enrolled courses will show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/dashboard/learn/${quiz.course.id}/${quiz.id}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-900 group-hover:text-brand-700">
                    {quiz.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {quiz.course.title}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                    quiz.passed
                      ? "bg-green-50 text-green-700"
                      : quiz.attempts > 0
                        ? "bg-amber-50 text-amber-700"
                        : "bg-zinc-100 text-zinc-500",
                  )}
                >
                  {quiz.passed ? "Passed" : quiz.attempts > 0 ? "Retake" : "New"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                <span>
                  <i className="fa-solid fa-list-check mr-1 text-brand-500" />
                  {quiz.totalQuestions} questions
                </span>
                <span>
                  <i className="fa-solid fa-rotate mr-1 text-brand-500" />
                  {quiz.attempts} attempt{quiz.attempts === 1 ? "" : "s"}
                </span>
                <span
                  className={cn(
                    "font-bold",
                    quiz.bestScore == null
                      ? "text-zinc-400"
                      : quiz.passed
                        ? "text-green-600"
                        : "text-amber-600",
                  )}
                >
                  {scoreLabel(quiz)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}