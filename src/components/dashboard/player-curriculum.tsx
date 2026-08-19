"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PlayerCurItem = {
  id: string;
  title: string;
  type: "lesson" | "video" | "quiz" | "assignment";
  duration_minutes: number;
  done: boolean;
  locked: boolean;
  current: boolean;
};

export type PlayerCurSection = {
  id: string;
  title: string;
  items: PlayerCurItem[];
};

const TYPE_ICON: Record<PlayerCurItem["type"], string> = {
  lesson: "fa-solid fa-book-open",
  video: "fa-solid fa-video",
  quiz: "fa-solid fa-circle-question",
  assignment: "fa-solid fa-clipboard-check",
};

export function PlayerCurriculum({
  sections,
  courseId,
  percent,
  doneCount,
  totalCount,
  onNavigate,
}: {
  sections: PlayerCurSection[];
  courseId: string;
  percent: number;
  doneCount: number;
  totalCount: number;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => i.title.toLowerCase().includes(q)),
      }))
      .filter((s) => s.items.length > 0);
  }, [sections, query]);

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Course Progress
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-zinc-900">
            {percent}%
          </span>
          <span className="text-xs text-zinc-500">
            {doneCount} / {totalCount} completed
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="relative mt-3">
          <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons..."
            className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-xs text-zinc-400">
            No lessons found.
          </p>
        )}
        {filtered.map((section, sIdx) => {
          const isOpen = open.has(section.id);
          return (
            <div key={section.id} className="mb-1 overflow-hidden rounded-xl">
              <button
                onClick={() => toggle(section.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-zinc-900">
                    {String(sIdx + 1).padStart(2, "0")} {section.title}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {section.items.filter((i) => i.done).length}/
                    {section.items.length} lessons
                  </p>
                </div>
                <i
                  className={cn(
                    "fa-solid fa-chevron-down text-[10px] text-zinc-400 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen && (
                <div className="ml-1 space-y-0.5 border-l border-zinc-200 pl-2">
                  {section.items.map((item) => {
                    const row = (
                      <div
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2",
                          item.current
                            ? "bg-brand-50"
                            : "hover:bg-zinc-50",
                        )}
                      >
                        {item.done ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                            <i className="fa-solid fa-check text-[8px]" />
                          </span>
                        ) : item.locked ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[9px] text-zinc-400">
                            <i className="fa-solid fa-lock" />
                          </span>
                        ) : item.current ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                            <i className="fa-solid fa-play text-[8px]" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[9px] text-zinc-500">
                            <i className={TYPE_ICON[item.type]} />
                          </span>
                        )}

                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-xs",
                            item.current
                              ? "font-semibold text-brand-700"
                              : item.done
                                ? "text-zinc-400"
                                : "text-zinc-700",
                          )}
                        >
                          {item.title}
                        </span>
                        {item.duration_minutes > 0 && (
                          <span className="shrink-0 text-[10px] text-zinc-400">
                            {item.duration_minutes}m
                          </span>
                        )}
                      </div>
                    );

                    if (item.locked) {
                      return <div key={item.id}>{row}</div>;
                    }
                    return (
                      <Link
                        key={item.id}
                        href={`/dashboard/learn/${courseId}/${item.id}`}
                        onClick={onNavigate}
                      >
                        {row}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}