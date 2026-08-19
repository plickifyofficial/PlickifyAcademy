"use client";

import { useState } from "react";
import {
  PlayerCurriculum,
  type PlayerCurSection,
} from "@/components/dashboard/player-curriculum";

export function PlayerShell({
  courseId,
  percent,
  doneCount,
  totalCount,
  sections,
  children,
}: {
  courseId: string;
  percent: number;
  doneCount: number;
  totalCount: number;
  sections: PlayerCurSection[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setDrawerOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 lg:hidden"
      >
        <i className="fa-solid fa-list-ul" /> Course Content ({percent}%)
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">{children}</div>
        <aside className="hidden lg:block">
          <div className="sticky top-[72px] max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <PlayerCurriculum
              sections={sections}
              courseId={courseId}
              percent={percent}
              doneCount={doneCount}
              totalCount={totalCount}
            />
          </div>
        </aside>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <p className="text-sm font-bold text-zinc-900">Course Content</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PlayerCurriculum
                sections={sections}
                courseId={courseId}
                percent={percent}
                doneCount={doneCount}
                totalCount={totalCount}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}