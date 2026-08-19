"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export function MarkAllReadButton({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!hasUnread) return null;

  async function handle() {
    setPending(true);
    await markAllNotificationsRead();
    router.refresh();
    setPending(false);
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
    >
      <i className="fa-solid fa-check-double" /> Mark all as read
    </button>
  );
}