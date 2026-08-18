"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CurItem = {
  id: string;
  title: string;
  type: "lesson" | "video" | "quiz" | "assignment";
  duration_minutes: number;
  is_free: boolean;
  done: boolean;
  locked: boolean;
  drip: boolean;
};

export type CurSection = {
  id: string;
  title: string;
  items: CurItem[];
};

const TYPE_META: Record<CurItem["type"], { icon: string; label: string }> = {
  lesson: { icon: "fa-solid fa-book-open", label: "Lesson" },
  video: { icon: "fa-solid fa-video", label: "Video" },
  quiz: { icon: "fa-solid fa-circle-question", label: "Quiz" },
  assignment: { icon: "fa-solid fa-clipboard-check", label: "Assignment" },
};

export function Curriculum({
  sections,
  courseSlug,
}: {
  sections: CurSection[];
  courseSlug: string;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  );

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sIdx) => {
        const isOpen = open.has(section.id);
        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <button
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                  {String(sIdx + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold text-zinc-900">
                    {section.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {section.items.length} topics ·{" "}
                    {section.items.reduce(
                      (s, t) => s + (t.duration_minutes || 0),
                      0,
                    )}{" "}
                    min
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm text-brand-600 transition-transform",
                  isOpen && "rotate-180",
                )}
              >
                <i className="fa-solid fa-chevron-down" />
              </span>
            </button>

            {isOpen && (
              <div className="divide-y divide-zinc-100 border-t border-zinc-100">
                {section.items.map((topic) => {
                  const meta = TYPE_META[topic.type];
                  return (
                    <div key={topic.id} className="flex items-center gap-4 px-5 py-3.5">
                      {topic.done ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                          <i className="fa-solid fa-check text-xs" />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                          <i className={`${meta.icon} text-[10px]`} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {topic.title}
                        </p>
                        <p className="text-xs text-zinc-400">{meta.label}</p>
                      </div>
                      {topic.duration_minutes > 0 && (
                        <span className="hidden text-xs text-zinc-400 sm:inline">
                          {topic.duration_minutes} min
                        </span>
                      )}
                      {topic.is_free && (
                        <span className="hidden rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700 sm:inline">
                          Free Preview
                        </span>
                      )}
                      {topic.locked ? (
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400"
                          title={
                            topic.drip
                              ? "Drip content — unlocks later"
                              : "Enroll in the course"
                          }
                        >
                          <i className="fa-solid fa-lock text-xs" />
                        </span>
                      ) : (
                        <Link
                          href={`/courses/${courseSlug}/lessons/${topic.id}`}
                          className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
                        >
                          {topic.done ? "Watch Again" : "Watch"}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}