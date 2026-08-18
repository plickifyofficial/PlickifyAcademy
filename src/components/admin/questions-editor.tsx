"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/types";
import {
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toaster";

export function QuestionsEditor({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  async function run(action: () => Promise<void>, success: string) {
    setPending(true);
    try {
      await action();
      showToast(success);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 rounded-md border border-[#e2e2e2] bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1d2327]">
          <i className="fa-solid fa-circle-question mr-1 text-[#2271b1]" />
          Quiz Questions ({questions.length})
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-semibold text-[#2271b1] hover:underline"
          >
            <i className="fa-solid fa-plus" /> Add Question
          </button>
        )}
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-md border border-[#e2e2e2] bg-[#fafafa] p-3">
          {editingId === q.id ? (
            <QuestionForm
              question={q}
              pending={pending}
              onDone={() => setEditingId(null)}
              onSubmit={(fd) =>
                run(() => updateQuizQuestion(fd), "Question updated")
              }
            />
          ) : (
            <div>
              <p className="text-sm font-medium text-[#3c434a]">
                {i + 1}. {q.question}
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-[#646970]">
                {q.options.map((opt, oi) => (
                  <li key={oi}>
                    {oi === q.correct_index ? (
                      <span className="font-semibold text-[#008a20]">
                        <i className="fa-solid fa-check mr-1" />
                        {opt}
                      </span>
                    ) : (
                      <span>{opt}</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setEditingId(q.id)}
                  className="wp-btn !px-2"
                >
                  <i className="fa-solid fa-pen text-xs" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (!confirm("Delete this question?")) return;
                    const fd = new FormData();
                    fd.set("id", q.id);
                    run(() => deleteQuizQuestion(fd), "Question deleted");
                  }}
                  className="wp-btn wp-btn-danger !px-2"
                >
                  <i className="fa-solid fa-trash text-xs" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding && (
        <QuestionForm
          lessonId={lessonId}
          pending={pending}
          onDone={() => setAdding(false)}
          onSubmit={(fd) =>
            run(() => createQuizQuestion(fd), "Question added")
          }
        />
      )}
    </div>
  );
}

function QuestionForm({
  lessonId,
  question,
  pending,
  onDone,
  onSubmit,
}: {
  lessonId?: string;
  question?: QuizQuestion;
  pending: boolean;
  onDone: () => void;
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const [optionsText, setOptionsText] = useState(
    question?.options.join("\n") ?? "",
  );
  const [correctIndex, setCorrectIndex] = useState(
    String(question?.correct_index ?? 0),
  );
  const optionCount = optionsText.split("\n").filter((o) => o.trim()).length;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (question) fd.set("id", question.id);
    fd.set("correct_index", correctIndex);
    void onSubmit(fd).then(onDone);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input type="hidden" name="lesson_id" value={question?.lesson_id ?? lessonId} />
      <div>
        <label className="wp-label">Question</label>
        <textarea name="question" rows={2} required defaultValue={question?.question} className="wp-input" />
      </div>
      <div>
        <label className="wp-label">Options (one per line)</label>
        <textarea
          rows={3}
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          className="wp-input font-mono text-xs"
          placeholder={"Correct answer\nWrong answer 1\nWrong answer 2"}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="wp-label">
            Correct answer index (0-{Math.max(optionCount - 1, 0)})
          </label>
          <input
            type="number"
            min={0}
            max={Math.max(optionCount - 1, 0)}
            value={correctIndex}
            onChange={(e) => setCorrectIndex(e.target.value)}
            className="wp-input"
            required
          />
        </div>
        <div>
          <label className="wp-label">Explanation (optional)</label>
          <input name="explanation" defaultValue={question?.explanation ?? ""} className="wp-input" />
        </div>
      </div>
      <input type="hidden" name="options" value={optionsText} />
      <div className="flex gap-2">
        <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
          <i className="fa-solid fa-floppy-disk" /> {pending ? "Saving..." : question ? "Update" : "Add"}
        </button>
        <button type="button" onClick={onDone} className="wp-btn">
          Cancel
        </button>
      </div>
    </form>
  );
}