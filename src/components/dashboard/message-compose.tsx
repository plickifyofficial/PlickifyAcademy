"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "@/lib/actions/messages";

export function MessageCompose({
  courses,
  onDone,
}: {
  courses: { id: string; title: string }[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const id = await startConversation(formData);
      router.push(`/dashboard/messages/${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send message.");
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-600">
          Subject
        </label>
        <input
          name="subject"
          required
          placeholder="What can we help you with?"
          className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {courses.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-zinc-600">
            Related course (optional)
          </label>
          <select
            name="course_id"
            defaultValue=""
            className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">General question</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-zinc-600">
          Message
        </label>
        <textarea
          name="body"
          required
          rows={5}
          placeholder="Write your message..."
          className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send Message"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}