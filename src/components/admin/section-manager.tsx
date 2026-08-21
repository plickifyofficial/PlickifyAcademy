"use client";

import { useState } from "react";
import { saveSectionsMeta } from "@/lib/actions/content";
import { cn } from "@/lib/utils";

type Props = {
  initialOrder: string[];
  initialHidden: string[];
  labels: Record<string, string>;
};

export function SectionManager({ initialOrder, initialHidden, labels }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [hidden, setHidden] = useState<string[]>(initialHidden);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function move(index: number, dir: -1 | 1) {
    setOrder((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMessage(null);
  }

  function toggleVisibility(key: string) {
    setHidden((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
    setMessage(null);
  }

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      await saveSectionsMeta(order, hidden);
      setMessage("Section layout saved.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to save section layout",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="wp-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">
            Homepage Sections
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Reorder with the arrows, hide sections you don&apos;t need.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={pending}
          className="wp-btn wp-btn-primary"
        >
          {pending ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Saving...
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk" /> Save Layout
            </>
          )}
        </button>
      </div>

      <ul className="divide-y divide-zinc-100">
        {order.map((key, index) => {
          const isHidden = hidden.includes(key);
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-3 px-5 py-3",
                isHidden && "bg-zinc-50",
              )}
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${labels[key] ?? key} up`}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <i className="fa-solid fa-chevron-up text-xs" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label={`Move ${labels[key] ?? key} down`}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <i className="fa-solid fa-chevron-down text-xs" />
                </button>
              </div>

              <span
                className={cn(
                  "flex-1 text-sm font-medium",
                  isHidden ? "text-zinc-400 line-through" : "text-zinc-800",
                )}
              >
                {labels[key] ?? key}
              </span>

              <span className="hidden font-mono text-[11px] text-zinc-400 sm:block">
                {key}
              </span>

              <button
                onClick={() => toggleVisibility(key)}
                aria-label={
                  isHidden ? `Show ${labels[key] ?? key}` : `Hide ${labels[key] ?? key}`
                }
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                  isHidden
                    ? "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700"
                    : "border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100",
                )}
              >
                <i
                  className={
                    isHidden ? "fa-solid fa-eye-slash text-sm" : "fa-solid fa-eye text-sm"
                  }
                />
              </button>
            </li>
          );
        })}
      </ul>

      {message && (
        <p className="border-t border-zinc-200 px-5 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
