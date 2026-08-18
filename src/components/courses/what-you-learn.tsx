"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type LearnModule = {
  id: string;
  position: number;
  title: string;
  items: { id: string; title: string; duration_minutes: number }[];
};

export function WhatYouLearn({ modules }: { modules: LearnModule[] }) {
  const [open, setOpen] = useState<string | null>(modules[0]?.id ?? null);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => {
        const isOpen = open === mod.id;
        return (
          <div
            key={mod.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-white shadow-sm transition-all",
              isOpen
                ? "border-brand-300 shadow-lg shadow-brand-100"
                : "border-zinc-100 hover:border-brand-200 hover:shadow-md",
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : mod.id)}
              className="flex w-full items-start gap-4 p-5 text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-extrabold text-white shadow-md shadow-brand-600/25">
                {String(mod.position).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-zinc-900">
                  {mod.title}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {mod.items.length} lessons
                </span>
              </span>
              <span
                className={cn(
                  "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition-transform",
                  isOpen
                    ? "rotate-180 bg-brand-600 text-white"
                    : "bg-brand-50 text-brand-600",
                )}
              >
                <i className="fa-solid fa-chevron-down" />
              </span>
            </button>

            {isOpen && (
              <div className="space-y-2 border-t border-zinc-100 px-5 pb-5 pt-4">
                {mod.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-lg bg-zinc-50 px-3 py-2.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                      <i className="fa-solid fa-check text-[10px] text-brand-700" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-zinc-700">
                      {item.title}
                    </span>
                    {item.duration_minutes > 0 && (
                      <span className="text-xs text-zinc-400">
                        {item.duration_minutes}min
                      </span>
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