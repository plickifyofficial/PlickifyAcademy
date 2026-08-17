"use client";

import { useState } from "react";
import { askQuestion, answerQuestion } from "@/lib/actions/learning";
import { useToast } from "@/components/ui/toaster";

type QnaItem = {
  id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

export function QnaSection({
  courseId,
  isEnrolled,
  isAdmin,
  items,
}: {
  courseId: string;
  isEnrolled: boolean;
  isAdmin: boolean;
  items: QnaItem[];
}) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [answerFor, setAnswerFor] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  async function handleAsk(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!question.trim()) return;
    setPending(true);
    try {
      await askQuestion(courseId, question);
      setQuestion("");
      showToast("প্রশ্ন জমা হয়েছে");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "জমা দেওয়া যায়নি", "error");
    } finally {
      setPending(false);
    }
  }

  async function handleAnswer(qnaId: string) {
    const text = (answers[qnaId] ?? "").trim();
    if (!text) return;
    setPending(true);
    try {
      await answerQuestion(qnaId, text);
      setAnswerFor(null);
      showToast("উত্তর জমা হয়েছে");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "উত্তর দেওয়া যায়নি", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-900">প্রশ্ন ও উত্তর</h2>

      {isEnrolled ? (
        <form
          onSubmit={handleAsk}
          className="mt-5 flex gap-2 rounded-2xl border border-zinc-200 bg-white p-4"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="কোর্স সম্পর্কে প্রশ্ন করুন..."
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            disabled={pending || !question.trim()}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <i className="fa-solid fa-paper-plane" /> জিজ্ঞেস করুন
          </button>
        </form>
      ) : (
        <p className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
          প্রশ্ন করতে হলে এনরোল করুন।
        </p>
      )}

      <div className="mt-6 space-y-4">
        {items.length === 0 && (
          <p className="text-zinc-500">এখনো কোনো প্রশ্ন নেই।</p>
        )}
        {items.map((q) => (
          <div key={q.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {(q.profiles?.full_name ?? "U").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{q.question}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {q.profiles?.full_name ?? "শিক্ষার্থী"} ·{" "}
                  {new Date(q.created_at).toLocaleDateString("bn-BD")}
                </p>
              </div>
            </div>

            {q.answer ? (
              <div className="mt-3 rounded-xl border-l-4 border-brand-500 bg-brand-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  <i className="fa-solid fa-reply mr-1" /> উত্তর
                </p>
                <p className="mt-1 text-sm text-zinc-700">{q.answer}</p>
              </div>
            ) : (
              isAdmin && (
                <div className="mt-3">
                  {answerFor === q.id ? (
                    <div className="flex gap-2">
                      <input
                        value={answers[q.id] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="উত্তর লিখুন..."
                        className="flex-1 rounded-xl border border-zinc-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleAnswer(q.id)}
                        disabled={pending || !(answers[q.id] ?? "").trim()}
                        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                      >
                        উত্তর দিন
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAnswerFor(q.id)}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      <i className="fa-solid fa-reply mr-1" /> উত্তর দিন
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
}