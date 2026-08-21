"use client";

import { useState } from "react";
import { saveAiAssistantSettings } from "@/lib/actions/ai";
import type { AiAssistantSettings } from "@/lib/ai/config";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: { key: keyof AiAssistantSettings["sources"]; label: string; hint: string }[] = [
  { key: "courses", label: "Courses", hint: "Published course info, prices, links" },
  { key: "lessons", label: "Course Lessons", hint: "Lesson titles and content" },
  { key: "batches", label: "Live Batches", hint: "Schedules, seats, status" },
  { key: "products", label: "Digital Products", hint: "Products, prices, formats" },
  { key: "blog", label: "Blog Posts", hint: "Published articles" },
  { key: "faq", label: "FAQ", hint: "All published FAQ entries" },
  { key: "pages", label: "About / Contact / Pages", hint: "CMS pages + custom pages" },
  { key: "policies", label: "Policies", hint: "Terms, privacy, refund" },
  { key: "studentContext", label: "Private Student Data", hint: "Logged-in student's own name + enrolled courses only" },
];

export function AiSettingsForm({ initial }: { initial: AiAssistantSettings }) {
  const [form, setForm] = useState<AiAssistantSettings>(initial);
  const [newQuestion, setNewQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function patch(p: Partial<AiAssistantSettings>) {
    setForm((prev) => ({ ...prev, ...p }));
    setMessage(null);
  }

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      await saveAiAssistantSettings(form);
      setMessage("AI Assistant settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic */}
      <div className="wp-panel p-5">
        <h2 className="text-base font-bold text-zinc-900">Basic</h2>
        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
            <input
              type="checkbox"
              checked={form.is_enabled}
              onChange={(e) => patch({ is_enabled: e.target.checked })}
              className="h-5 w-5 accent-[#2271b1]"
            />
            <span>
              <span className="block text-sm font-bold text-zinc-800">
                AI Assistant — ON
              </span>
              <span className="block text-xs text-zinc-500">
                Shows the floating chat widget on the public website.
              </span>
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              AI Name
            </span>
            <input
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              maxLength={60}
              className="wp-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              Welcome Message
            </span>
            <textarea
              value={form.welcomeMessage}
              onChange={(e) => patch({ welcomeMessage: e.target.value })}
              rows={3}
              maxLength={600}
              className="wp-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
              Extra System Instruction (optional)
            </span>
            <textarea
              value={form.systemInstruction}
              onChange={(e) => patch({ systemInstruction: e.target.value })}
              rows={4}
              maxLength={4000}
              placeholder="e.g. Always suggest the Live Batch first for beginners. Never mention competitor platforms."
              className="wp-input"
            />
            <span className="mt-1 block text-[11px] text-zinc-400">
              Added on top of the built-in strict grounding rules.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                Tone
              </span>
              <select
                value={form.tone}
                onChange={(e) => patch({ tone: e.target.value as AiAssistantSettings["tone"] })}
                className="wp-input"
              >
                <option value="friendly">Friendly + Professional</option>
                <option value="professional">Strictly Professional</option>
                <option value="playful">Playful</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                Answer Length
              </span>
              <select
                value={form.answerLength}
                onChange={(e) =>
                  patch({ answerLength: e.target.value as AiAssistantSettings["answerLength"] })
                }
                className="wp-input"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Knowledge sources */}
      <div className="wp-panel p-5">
        <h2 className="text-base font-bold text-zinc-900">Knowledge Sources</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Choose which content the AI is allowed to learn from. Only published
          content is ever indexed.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SOURCE_LABELS.map((s) => (
            <label
              key={s.key}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                form.sources[s.key]
                  ? "border-brand-300 bg-brand-50/60"
                  : "border-zinc-200 bg-white",
              )}
            >
              <input
                type="checkbox"
                checked={form.sources[s.key]}
                onChange={(e) =>
                  patch({ sources: { ...form.sources, [s.key]: e.target.checked } })
                }
                className="mt-0.5 h-4 w-4 accent-[#2271b1]"
              />
              <span>
                <span className="block text-sm font-semibold text-zinc-800">{s.label}</span>
                <span className="block text-[11px] text-zinc-500">{s.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Suggested questions */}
      <div className="wp-panel p-5">
        <h2 className="text-base font-bold text-zinc-900">Suggested Questions</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Shown as quick-tap chips when the chat opens (max 8).
        </p>
        <ul className="mt-4 space-y-2">
          {form.suggestedQuestions.map((q, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => {
                  const next = [...form.suggestedQuestions];
                  next[i] = e.target.value;
                  patch({ suggestedQuestions: next });
                }}
                className="wp-input flex-1"
              />
              <button
                onClick={() =>
                  patch({
                    suggestedQuestions: form.suggestedQuestions.filter((_, j) => j !== i),
                  })
                }
                aria-label={`Remove question ${i + 1}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </li>
          ))}
        </ul>
        {form.suggestedQuestions.length < 8 && (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newQuestion.trim()) {
                  patch({
                    suggestedQuestions: [...form.suggestedQuestions, newQuestion.trim()],
                  });
                  setNewQuestion("");
                }
              }}
              placeholder="Add a suggested question..."
              className="wp-input flex-1"
            />
            <button
              onClick={() => {
                if (!newQuestion.trim()) return;
                patch({
                  suggestedQuestions: [...form.suggestedQuestions, newQuestion.trim()],
                });
                setNewQuestion("");
              }}
              className="wp-btn"
            >
              <i className="fa-solid fa-plus" /> Add
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={pending} className="wp-btn wp-btn-primary">
          <i className={pending ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-cloud-arrow-up"} />
          Save Settings
        </button>
        {message && <span className="text-sm text-zinc-600">{message}</span>}
      </div>
    </div>
  );
}
