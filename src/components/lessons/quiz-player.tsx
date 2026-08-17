"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";
import { submitQuiz } from "@/lib/actions/learning";
import type { QuizResult } from "@/lib/actions/learning";

export function QuizPlayer({
  lessonId,
  passPercent,
  questions,
}: {
  lessonId: string;
  passPercent: number;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-zinc-500">
        এই কুইজে এখনো প্রশ্ন যোগ করা হয়নি। শীঘ্রই আসছে।
      </div>
    );
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      setError("সব প্রশ্নের উত্তর দিন।");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await submitQuiz(lessonId, answers);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "জমা দেওয়া যায়নি");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    const passed = result.passed;
    return (
      <div
        className={`rounded-2xl border p-6 ${
          passed
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div className="text-center">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white ${
              passed ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <i className={passed ? "fa-solid fa-check" : "fa-solid fa-xmark"} />
          </span>
          <h3
            className={`mt-4 text-xl font-bold ${
              passed ? "text-green-700" : "text-red-700"
            }`}
          >
            {passed ? "কুইজ পাস! 🎉" : "পাস করেননি"}
          </h3>
          <p className="mt-1 text-zinc-600">
            আপনার স্কোর: <strong>{result.score}</strong>/{result.total} (
            {result.percent}%) — পাস মার্ক: {result.passPercent}%
          </p>
          {!passed && (
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="mt-4 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              আবার চেষ্টা করুন
            </button>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {result.details.map((d, i) => (
            <div
              key={i}
              className={`rounded-xl border bg-white p-4 ${
                d.isCorrect ? "border-green-200" : "border-red-200"
              }`}
            >
              <p className="font-medium text-zinc-900">
                <span className={d.isCorrect ? "text-green-600" : "text-red-600"}>
                  <i
                    className={
                      d.isCorrect
                        ? "fa-solid fa-circle-check mr-1"
                        : "fa-solid fa-circle-xmark mr-1"
                    }
                  />
                </span>
                {i + 1}. {d.question}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {questions[i].options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={
                      oi === d.correct
                        ? "font-semibold text-green-700"
                        : oi === d.chosen && !d.isCorrect
                          ? "font-medium text-red-600"
                          : "text-zinc-600"
                    }
                  >
                    {oi === d.correct && (
                      <i className="fa-solid fa-check mr-1" />
                    )}
                    {oi === d.chosen && !d.isCorrect && (
                      <i className="fa-solid fa-xmark mr-1" />
                    )}
                    {opt}
                  </li>
                ))}
              </ul>
              {d.explanation && (
                <p className="mt-2 rounded-lg bg-zinc-50 p-2 text-sm text-zinc-600">
                  <i className="fa-solid fa-circle-info mr-1 text-brand-600" />
                  {d.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <p className="text-sm text-zinc-600">
          মোট <strong>{questions.length}</strong>টি প্রশ্ন · পাস মার্ক{" "}
          <strong>{passPercent}%</strong>
        </p>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {Object.keys(answers).length}/{questions.length} উত্তর
        </span>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="font-semibold text-zinc-900">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              return (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                    selected
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={selected}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                    }
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className="font-medium text-zinc-800">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "জমা হচ্ছে..." : "উত্তর জমা দিন"}
      </button>
    </div>
  );
}