"use client";

import { useState } from "react";
import type { Lesson, LessonResource } from "@/lib/types";
import {
  uploadLessonResource,
  deleteLessonResource,
} from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toaster";

export function LessonResourcesPanel({
  courseId,
  lessons,
  resourcesByLesson,
}: {
  courseId: string;
  lessons: Lesson[];
  resourcesByLesson: Record<string, LessonResource[]>;
}) {
  const [selected, setSelected] = useState<string>("");
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  const resources = selected ? resourcesByLesson[selected] ?? [] : [];

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = e.currentTarget;
    setPending(true);
    try {
      await uploadLessonResource(new FormData(form));
      showToast("File uploaded");
      form.reset();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file? Students will lose access.")) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("course_id", courseId);
      await deleteLessonResource(fd);
      showToast("File deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="wp-input"
      >
        <option value="">Select a lesson...</option>
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.title}
          </option>
        ))}
      </select>

      {selected && (
        <>
          <div className="space-y-2">
            {resources.length === 0 ? (
              <p className="text-xs text-[#646970]">
                No files attached to this lesson yet.
              </p>
            ) : (
              resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-[#e2e2e2] bg-[#fafafa] px-3 py-2"
                >
                  <i className="fa-solid fa-file text-[#2271b1]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1d2327]">
                      {r.title}
                    </p>
                    <p className="text-xs text-[#646970]">
                      {r.file_size ?? "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={pending}
                    className="wp-btn wp-btn-danger !px-2"
                    aria-label="Delete"
                  >
                    <i className="fa-solid fa-trash text-xs" />
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleUpload}
            className="flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="lesson_id" value={selected} />
            <input
              type="file"
              name="file"
              required
              className="text-sm text-[#646970] file:mr-3 file:rounded-md file:border-0 file:bg-[#2271b1] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
            <button
              type="submit"
              disabled={pending}
              className="wp-btn wp-btn-primary"
            >
              <i className="fa-solid fa-upload" /> Upload
            </button>
          </form>
        </>
      )}
    </div>
  );
}