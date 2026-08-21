"use client";

import { useState } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
} from "@/lib/actions/pages";
import { cn } from "@/lib/utils";

export type CustomPageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  is_published: boolean;
  show_in_footer: boolean;
};

export function CustomPagesManager({ initialPages }: { initialPages: CustomPageRow[] }) {
  const [pages, setPages] = useState<CustomPageRow[]>(initialPages);
  const [newTitle, setNewTitle] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function patchLocal(id: string, p: Partial<CustomPageRow>) {
    setPages((prev) => prev.map((pg) => (pg.id === id ? { ...pg, ...p } : pg)));
    setMessage(null);
  }

  async function handleCreate() {
    if (!newTitle.trim()) {
      setMessage("Enter a page title first.");
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      const res = await createCustomPage(newTitle.trim());
      setPages((prev) => [
        ...prev,
        {
          id: res.id,
          slug: res.slug,
          title: newTitle.trim(),
          body: "<p>Write your page content here...</p>",
          is_published: true,
          show_in_footer: false,
        },
      ]);
      setNewTitle("");
      setExpanded(res.id);
      setMessage("Page created — now add its content.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setPending(false);
    }
  }

  async function handleSave(page: CustomPageRow) {
    setPending(true);
    setMessage(null);
    try {
      await updateCustomPage(page.id, {
        title: page.title,
        slug: page.slug,
        body: page.body,
        is_published: page.is_published,
        show_in_footer: page.show_in_footer,
      });
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setPending(true);
    setMessage(null);
    try {
      await deleteCustomPage(id);
      setPages((prev) => prev.filter((pg) => pg.id !== id));
      if (expanded === id) setExpanded(null);
      setMessage("Page deleted.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="wp-panel">
      <div className="flex flex-wrap items-end gap-3 border-b border-zinc-200 px-5 py-4">
        <div className="flex-1">
          <h2 className="text-base font-bold text-zinc-900">Custom Pages</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Each page lives at <code className="font-mono">/p/your-page-url</code>.
            Tick &quot;Show in footer&quot; to add it to the footer links.
          </p>
        </div>
        <div className="flex w-full max-w-sm items-center gap-2 sm:w-auto">
          <input
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setMessage(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && !pending && handleCreate()}
            placeholder="New page title..."
            className="min-h-10 flex-1 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-brand-500"
          />
          <button
            onClick={handleCreate}
            disabled={pending}
            className="wp-btn wp-btn-primary whitespace-nowrap"
          >
            <i className="fa-solid fa-plus" /> Create
          </button>
        </div>
      </div>

      {pages.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-400">
          No custom pages yet. Create your first one above.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {pages.map((page) => {
            const isOpen = expanded === page.id;
            return (
              <li key={page.id}>
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <i className="fa-regular fa-file-lines" />
                  </span>
                  <span className="min-w-0 flex-1 font-semibold text-zinc-800">
                    {page.title}
                  </span>
                  {!page.is_published && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      Draft
                    </span>
                  )}
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden max-w-[220px] truncate font-mono text-xs text-zinc-400 hover:text-brand-600 sm:block"
                  >
                    /p/{page.slug}
                  </a>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                      page.is_published
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-white text-zinc-400",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={page.is_published}
                      onChange={(e) => patchLocal(page.id, { is_published: e.target.checked })}
                      className="accent-emerald-600"
                    />
                    Published
                  </label>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                      page.show_in_footer
                        ? "border-brand-200 bg-brand-50 text-brand-600"
                        : "border-zinc-200 bg-white text-zinc-400",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={page.show_in_footer}
                      onChange={(e) => patchLocal(page.id, { show_in_footer: e.target.checked })}
                      className="accent-brand-600"
                    />
                    Footer
                  </label>
                  <button
                    onClick={() => setExpanded(isOpen ? null : page.id)}
                    className="wp-btn !min-h-8 !px-3 !text-xs"
                  >
                    <i className={cn("fa-solid", isOpen ? "fa-chevron-up" : "fa-pen")} />
                    {isOpen ? "Close" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={pending}
                    aria-label={`Delete ${page.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <i className="fa-solid fa-trash-can text-xs" />
                  </button>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t border-zinc-100 bg-zinc-50/60 px-5 py-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                          Page Title
                        </span>
                        <input
                          value={page.title}
                          onChange={(e) => patchLocal(page.id, { title: e.target.value })}
                          className="min-h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-brand-500"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                          URL Slug
                        </span>
                        <div className="flex min-h-10 items-center rounded-lg border border-zinc-300 bg-white px-3 focus-within:border-brand-500">
                          <span className="font-mono text-xs text-zinc-400">/p/</span>
                          <input
                            value={page.slug}
                            onChange={(e) => patchLocal(page.id, { slug: e.target.value })}
                            className="w-full flex-1 font-mono text-sm outline-none"
                          />
                        </div>
                      </label>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Content
                      </span>
                      <RichTextEditor
                        value={page.body}
                        onChange={(v) => patchLocal(page.id, { body: v })}
                        preset="basic"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(page)}
                        disabled={pending}
                        className="wp-btn wp-btn-primary"
                      >
                        <i className="fa-solid fa-cloud-arrow-up" /> Save Page
                      </button>
                      <Link
                        href={`/p/${page.slug}`}
                        target="_blank"
                        className="wp-btn"
                      >
                        <i className="fa-solid fa-eye" /> View
                      </Link>
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
