"use client";

import { useState } from "react";
import { MessageThread } from "@/components/dashboard/message-thread";
import { cn } from "@/lib/utils";

export function AdminMessagesInbox({
  conversations,
  messages,
}: {
  conversations: {
    id: string;
    subject: string;
    courseTitle: string | null;
    student: string;
    lastMessageAt: string;
  }[];
  messages: {
    id: string;
    conversationId: string;
    body: string;
    createdAt: string;
    author: string;
    fromStudent: boolean;
  }[];
}) {
  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-400">
          <i className="fa-solid fa-envelope-open-text" />
        </span>
        <p className="mt-4 font-semibold text-zinc-900">No messages yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Student conversations will appear here.
        </p>
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const activeMessages = messages
    .filter((m) => m.conversationId === active.id)
    .map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      author: m.author,
      own: !m.fromStudent,
    }));

  const unreadByConversation: Record<string, number> = {};
  for (const m of messages) {
    if (m.fromStudent) {
      unreadByConversation[m.conversationId] =
        (unreadByConversation[m.conversationId] ?? 0) + 1;
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <ul className="max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-zinc-50",
                  c.id === active.id && "bg-brand-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-zinc-900">
                    {c.subject}
                  </p>
                  {unreadByConversation[c.id] > 0 && (
                    <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadByConversation[c.id]}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-zinc-500">{c.student}</p>
                <p className="truncate text-[11px] text-zinc-400">
                  {c.courseTitle ?? "General"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-zinc-900">{active.subject}</h2>
            <p className="text-xs text-zinc-500">
              {active.student} · {active.courseTitle ?? "General support"}
            </p>
          </div>
        </div>
        <MessageThread
          conversationId={active.id}
          messages={activeMessages}
        />
      </div>
    </div>
  );
}