"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { addLessonComment, saveLessonNote } from "@/lib/actions/learning";

type Resource = {
  id: string;
  title: string;
  file_type: string | null;
  file_size: string | null;
};

type Comment = {
  id: string;
  comment: string;
  created_at: string;
  author: string;
};

const TABS = [
  { key: "overview", label: "Overview", icon: "fa-solid fa-book-open" },
  { key: "resources", label: "Resources", icon: "fa-solid fa-download" },
  { key: "notes", label: "Notes", icon: "fa-solid fa-note-sticky" },
  { key: "discussion", label: "Discussion", icon: "fa-solid fa-comments" },
];

export function LessonTabs({
  lessonId,
  description,
  content,
  resources,
  initialNote,
  comments,
}: {
  lessonId: string;
  description: string | null;
  content: string | null;
  resources: Resource[];
  initialNote: string;
  comments: Comment[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState(initialNote);
  const [noteSaved, setNoteSaved] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSaveNote() {
    setSavingNote(true);
    try {
      await saveLessonNote(lessonId, note);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch {
      // surface silently
    } finally {
      setSavingNote(false);
    }
  }

  async function handlePostComment() {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await addLessonComment(lessonId, comment);
      setComment("");
      router.refresh();
    } catch {
      // surface silently
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              tab === t.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800",
            )}
          >
            <i className={t.icon} /> {t.label}
          </button>
        ))}
      </div>

      <div className="py-5">
        {tab === "overview" && (
          <div className="space-y-4">
            {description && <p className="text-zinc-700">{description}</p>}
            {content && (
              <div className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed text-zinc-700">
                {content}
              </div>
            )}
            {!description && !content && (
              <p className="text-sm text-zinc-400">
                কোনো description নেই এই lesson-এ।
              </p>
            )}
          </div>
        )}

        {tab === "resources" && (
          <div className="space-y-2.5">
            {resources.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                কোনো downloadable resource নেই এখনো।
              </p>
            ) : (
              resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
                    <i className="fa-solid fa-file-lines" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {r.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {[r.file_type, r.file_size].filter(Boolean).join(" · ") ||
                        "File"}
                    </p>
                  </div>
                  <a
                    href={`/api/resource/${r.id}`}
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    <i className="fa-solid fa-download" /> Download
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "notes" && (
          <div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">My Notes</p>
                <span className="text-xs text-zinc-400">
                  শুধু আপনি দেখতে পাবেন
                </span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                placeholder="এই lesson-এর গুরুত্বপূর্ণ পয়েন্টগুলো লিখে রাখুন..."
                className="mt-3 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  <i className="fa-solid fa-floppy-disk" />
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
                {noteSaved && (
                  <span className="text-sm font-medium text-green-600">
                    ✓ Saved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "discussion" && (
          <div>
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                  এখনো কোনো comment নেই। প্রথম comment করুন।
                </p>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {(c.author || "S").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {c.author}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700">{c.comment}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="আপনার প্রশ্ন বা মন্তব্য লিখুন..."
                className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={posting || !comment.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  <i className="fa-solid fa-paper-plane" />
                  {posting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}