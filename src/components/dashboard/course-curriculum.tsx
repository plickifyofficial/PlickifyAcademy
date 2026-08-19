"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CurItem = {
  id: string;
  title: string;
  type: "lesson" | "video" | "quiz" | "assignment";
  duration_minutes: number;
  done: boolean;
  locked: boolean;
  current: boolean;
};

export type CurSection = {
  id: string;
  title: string;
  items: CurItem[];
};

const TYPE_ICON: Record<CurItem["type"], string> = {
  lesson: "fa-solid fa-book-open",
  video: "fa-solid fa-video",
  quiz: "fa-solid fa-circle-question",
  assignment: "fa-solid fa-clipboard-check",
};

export function CourseCurriculum({
  sections,
  courseId,
}: {
  sections: CurSection[];
  courseId: string;
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
        const done = section.items.filter((i) => i.done).length;
        const sectionComplete = section.items.length > 0 && done === section.items.length;

        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <button
              onClick={() => toggle(section.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white">
                  {String(sIdx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-900">
                    {section.title}
                  </p>
                  <p
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      sectionComplete ? "text-green-600" : "text-zinc-500",
                    )}
                  >
                    {sectionComplete && <i className="fa-solid fa-circle-check" />}
                    {sectionComplete ? "All Lessons Completed" : `${done}/${section.items.length} Lessons`}
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
                {section.items.map((topic, tIdx) => (
                  <div
                    key={topic.id}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3.5",
                      topic.current && "bg-brand-50/60",
                    )}
                  >
                    {topic.done ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                        <i className="fa-solid fa-check text-xs" />
                      </span>
                    ) : topic.locked ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400">
                        <i className="fa-solid fa-lock" />
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-600">
                        <i className={TYPE_ICON[topic.type]} />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-400">
                          {String(tIdx + 1).padStart(2, "0")}
                        </span>
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            topic.done ? "text-zinc-500" : "text-zinc-900",
                          )}
                        >
                          {topic.title}
                        </p>
                        {topic.current && (
                          <span className="shrink-0 rounded-full bg-brand-600 px-2 py-px text-[10px] font-bold text-white">
                            Current
                          </span>
                        )}
                      </div>
                      {topic.duration_minutes > 0 && (
                        <p className="ml-6 text-xs text-zinc-400">
                          {topic.duration_minutes} min
                        </p>
                      )}
                    </div>

                    {topic.done ? (
                      <Link
                        href={`/dashboard/learn/${courseId}/${topic.id}`}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-500 transition-colors hover:bg-zinc-100"
                      >
                        ✓ Completed
                      </Link>
                    ) : topic.locked ? (
                      <span
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-400"
                        title="Drip content — unlocks later"
                      >
                        <i className="fa-solid fa-lock mr-1" /> Locked
                      </span>
                    ) : (
                      <Link
                        href={`/dashboard/learn/${courseId}/${topic.id}`}
                        className={cn(
                          "shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
                          topic.current
                            ? "bg-brand-600 text-white hover:bg-brand-700"
                            : "bg-brand-50 text-brand-700 hover:bg-brand-100",
                        )}
                      >
                        {topic.current ? "Continue" : "Start"}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}