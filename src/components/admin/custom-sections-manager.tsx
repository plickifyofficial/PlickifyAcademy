"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  saveCustomSections,
  type CustomSectionItem,
} from "@/lib/actions/content";
import { cn } from "@/lib/utils";

type Props = {
  initialItems: CustomSectionItem[];
};

function newId() {
  return `cs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function CustomSectionsManager({ initialItems }: Props) {
  const [items, setItems] = useState<CustomSectionItem[]>(initialItems);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update(id: string, patch: Partial<CustomSectionItem>) {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
    setMessage(null);
  }

  function addSection() {
    const item: CustomSectionItem = {
      id: newId(),
      title: "New Section",
      eyebrow: "",
      body: "<p>Write your content here...</p>",
      visible: true,
    };
    setItems((prev) => [...prev, item]);
    setExpanded(item.id);
    setMessage(null);
  }

  function duplicateSection(id: string) {
    const source = items.find((s) => s.id === id);
    if (!source) return;
    const copy: CustomSectionItem = {
      ...source,
      id: newId(),
      title: `${source.title} (Copy)`,
    };
    const index = items.findIndex((s) => s.id === id);
    setItems((prev) => [
      ...prev.slice(0, index + 1),
      copy,
      ...prev.slice(index + 1),
    ]);
    setExpanded(copy.id);
    setMessage(null);
  }

  function deleteSection(id: string) {
    if (!confirm("Delete this section? This cannot be undone.")) return;
    setItems((prev) => prev.filter((s) => s.id !== id));
    setMessage(null);
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMessage(null);
  }

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      await saveCustomSections(items);
      setMessage("Custom sections saved.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to save custom sections",
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
            Custom Sections
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Create your own sections with rich text. They appear below the
            built-in homepage sections.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={addSection} className="wp-btn" disabled={pending}>
            <i className="fa-solid fa-plus" /> Add Section
          </button>
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
                <i className="fa-solid fa-floppy-disk" /> Save Sections
              </>
            )}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-500">
          No custom sections yet. Click “Add Section” to create one.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {items.map((section, index) => {
            const isOpen = expanded === section.id;
            return (
              <li key={section.id} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <i className="fa-solid fa-chevron-up text-xs" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label="Move down"
                      className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <i className="fa-solid fa-chevron-down text-xs" />
                    </button>
                  </div>

                  <span
                    className={cn(
                      "flex-1 truncate text-sm font-medium",
                      !section.visible && "text-zinc-400 line-through",
                    )}
                  >
                    {section.title || "Untitled Section"}
                  </span>

                  <button
                    onClick={() =>
                      update(section.id, { visible: !section.visible })
                    }
                    aria-label={section.visible ? "Hide" : "Show"}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      section.visible
                        ? "border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100"
                        : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-700",
                    )}
                  >
                    <i
                      className={
                        section.visible
                          ? "fa-solid fa-eye text-sm"
                          : "fa-solid fa-eye-slash text-sm"
                      }
                    />
                  </button>

                  <button
                    onClick={() => setExpanded(isOpen ? null : section.id)}
                    className="wp-btn !min-h-8 !px-3 !text-xs"
                  >
                    <i
                      className={
                        isOpen ? "fa-solid fa-chevron-up" : "fa-solid fa-pen"
                      }
                    />{" "}
                    {isOpen ? "Close" : "Edit"}
                  </button>

                  <button
                    onClick={() => duplicateSection(section.id)}
                    aria-label="Duplicate"
                    title="Duplicate"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:text-zinc-800"
                  >
                    <i className="fa-solid fa-copy text-sm" />
                  </button>

                  <button
                    onClick={() => deleteSection(section.id)}
                    aria-label="Delete"
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-colors hover:bg-red-50"
                  >
                    <i className="fa-solid fa-trash text-sm" />
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div>
                      <label className="wp-label">Eyebrow (optional)</label>
                      <input
                        type="text"
                        value={section.eyebrow}
                        onChange={(e) =>
                          update(section.id, { eyebrow: e.target.value })
                        }
                        className="wp-input"
                        placeholder="e.g. WHY CHOOSE US"
                      />
                    </div>
                    <div>
                      <label className="wp-label">Title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) =>
                          update(section.id, { title: e.target.value })
                        }
                        className="wp-input"
                      />
                    </div>
                    <div>
                      <label className="wp-label">Content</label>
                      <RichTextEditor
                        value={section.body}
                        onChange={(html) => update(section.id, { body: html })}
                        preset="basic"
                        minHeight={220}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {message && (
        <p className="border-t border-zinc-200 px-5 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
