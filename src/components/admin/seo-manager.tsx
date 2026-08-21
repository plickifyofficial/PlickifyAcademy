"use client";

import { useState } from "react";
import { saveSeoOverrides } from "@/lib/actions/content";
import type { SeoPageOverride, SeoOverrides } from "@/lib/seo";

type Props = {
  pages: { path: string; label: string }[];
  initial: SeoOverrides;
};

export function SeoManager({ pages, initial }: Props) {
  const [values, setValues] = useState<SeoOverrides>(initial);
  const [expanded, setExpanded] = useState<string | null>(
    pages[0]?.path ?? null,
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function patch(path: string, p: Partial<SeoPageOverride>) {
    setValues((prev) => ({
      ...prev,
      [path]: { ...prev[path], ...p },
    }));
    setMessage(null);
  }

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      await saveSeoOverrides(values);
      setMessage("SEO settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  const overriddenCount = Object.values(values).filter(
    (v) => v?.title?.trim() || v?.description?.trim(),
  ).length;

  return (
    <div className="wp-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Per-Page SEO</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Override the browser title and description for any page. Leave a
            field empty to keep the built-in default.{" "}
            {overriddenCount > 0 && `(${overriddenCount} customized)`}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={pending}
          className="wp-btn wp-btn-primary"
        >
          <i className={pending ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-cloud-arrow-up"} />
          Save All
        </button>
      </div>

      <ul className="divide-y divide-zinc-100">
        {pages.map((page) => {
          const isOpen = expanded === page.path;
          const v = values[page.path] ?? {};
          const active = !!(v.title?.trim() || v.description?.trim());
          return (
            <li key={page.path}>
              <button
                onClick={() => setExpanded(isOpen ? null : page.path)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-zinc-50"
              >
                <i
                  className={
                    isOpen
                      ? "fa-solid fa-chevron-down text-xs text-zinc-400"
                      : "fa-solid fa-chevron-right text-xs text-zinc-400"
                  }
                />
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <i className="fa-solid fa-magnifying-glass-chart text-sm" />
                </span>
                <span className="flex-1 text-sm font-semibold text-zinc-800">
                  {page.label}
                </span>
                <span className="hidden font-mono text-xs text-zinc-400 sm:block">
                  {page.path}
                </span>
                {active ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    Custom
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                    Default
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Meta Title
                    </span>
                    <input
                      value={v.title ?? ""}
                      onChange={(e) => patch(page.path, { title: e.target.value })}
                      placeholder={`Default title for ${page.label}`}
                      maxLength={200}
                      className="wp-input"
                    />
                    <span className="mt-1 block text-[11px] text-zinc-400">
                      {(v.title ?? "").length}/200 characters
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Meta Description
                    </span>
                    <textarea
                      value={v.description ?? ""}
                      onChange={(e) => patch(page.path, { description: e.target.value })}
                      placeholder={`Default description for ${page.label}`}
                      rows={3}
                      maxLength={320}
                      className="wp-input"
                    />
                    <span className="mt-1 block text-[11px] text-zinc-400">
                      {(v.description ?? "").length}/320 characters — Google shows ~160
                    </span>
                  </label>
                </div>
              )}
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
