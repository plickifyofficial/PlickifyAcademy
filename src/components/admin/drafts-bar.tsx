"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishAllDrafts, publishDraft, discardDraft } from "@/lib/actions/content";

type DraftRow = { key: string; label: string; updatedAt: string };

export function DraftsBar({ drafts }: { drafts: DraftRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (drafts.length === 0) return null;

  async function publishOne(key: string) {
    setPending(key);
    setMessage(null);
    try {
      await publishDraft(key);
      setMessage("Published.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPending(null);
    }
  }

  async function publishEverything() {
    setPending("__all");
    setMessage(null);
    try {
      const res = await publishAllDrafts();
      setMessage(`Published ${res.count} section(s).`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to publish all");
    } finally {
      setPending(null);
    }
  }

  async function discard(key: string) {
    if (!confirm("Discard this draft? The live version stays unchanged.")) return;
    setPending(key);
    setMessage(null);
    try {
      await discardDraft(key);
      setMessage("Draft discarded.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to discard");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="wp-panel border-amber-300 bg-amber-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900">
            <i className="fa-solid fa-pen-to-square mr-2 text-amber-600" />
            Pending Drafts ({drafts.length})
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            These changes are not live yet.{" "}
            <a
              href="/preview"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 underline"
            >
              Open Preview
            </a>
          </p>
        </div>
        <button
          onClick={publishEverything}
          disabled={pending === "__all"}
          className="wp-btn wp-btn-primary"
        >
          {pending === "__all" ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Publishing...
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up" /> Publish All
            </>
          )}
        </button>
      </div>
      <ul className="divide-y divide-amber-100">
        {drafts.map((d) => (
          <li key={d.key} className="flex items-center gap-3 px-5 py-3">
            <span className="flex-1 text-sm font-medium text-zinc-800">
              {d.label}
            </span>
            <span className="hidden text-xs text-zinc-400 sm:block">
              {new Date(d.updatedAt).toLocaleString()}
            </span>
            <button
              onClick={() => publishOne(d.key)}
              disabled={pending === d.key}
              className="wp-btn wp-btn-primary !min-h-8 !px-3 !text-xs"
            >
              <i className="fa-solid fa-cloud-arrow-up" /> Publish
            </button>
            <button
              onClick={() => discard(d.key)}
              disabled={pending === d.key}
              className="wp-btn !min-h-8 !px-3 !text-xs"
            >
              <i className="fa-solid fa-trash-can" /> Discard
            </button>
          </li>
        ))}
      </ul>
      {message && (
        <p className="border-t border-amber-200 px-5 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}
    </div>
  );
}
