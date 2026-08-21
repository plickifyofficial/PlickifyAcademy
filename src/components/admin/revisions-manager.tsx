"use client";

import { useState } from "react";
import { getRevisionValue, restoreRevision } from "@/lib/actions/content";

type RevisionRow = {
  id: string;
  key: string;
  createdAt: string;
  label: string;
};

export function RevisionsManager({
  initialRevisions,
}: {
  initialRevisions: RevisionRow[];
}) {
  const [revisions] = useState(initialRevisions);
  const [preview, setPreview] = useState<{
    id: string;
    key: string;
    value: unknown;
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function view(id: string) {
    setMessage(null);
    try {
      const data = await getRevisionValue(id);
      setPreview({ id, key: data.key, value: data.value });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load revision");
    }
  }

  async function restore(id: string) {
    if (
      !confirm(
        "Restore this version? The current content will be saved as a new revision first.",
      )
    )
      return;
    setPendingId(id);
    setMessage(null);
    try {
      await restoreRevision(id);
      setMessage("Version restored. The website is updated.");
      setPreview(null);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to restore revision",
      );
    } finally {
      setPendingId(null);
    }
  }

  if (revisions.length === 0) {
    return (
      <div className="wp-panel px-5 py-8 text-center text-sm text-zinc-500">
        No revisions yet. Revisions are created automatically the second time
        you save a section.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="wp-panel divide-y divide-zinc-100">
        {revisions.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800">{r.label}</p>
              <p className="text-xs text-zinc-400">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
            <button onClick={() => view(r.id)} className="wp-btn !min-h-8 !px-3 !text-xs">
              <i className="fa-solid fa-eye" /> View
            </button>
            <button
              onClick={() => restore(r.id)}
              disabled={pendingId === r.id}
              className="wp-btn wp-btn-primary !min-h-8 !px-3 !text-xs"
            >
              {pendingId === r.id ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Restoring...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-clock-rotate-left" /> Restore
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {preview && (
        <div className="wp-panel">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
            <h3 className="text-sm font-bold text-zinc-900">
              Preview — {preview.key}
            </h3>
            <button
              onClick={() => setPreview(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              aria-label="Close preview"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <pre className="max-h-96 overflow-auto px-5 py-4 text-xs leading-relaxed text-zinc-700">
            {JSON.stringify(preview.value, null, 2)}
          </pre>
        </div>
      )}

      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}
