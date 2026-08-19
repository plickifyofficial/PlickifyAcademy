"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessage, markConversationRead } from "@/lib/actions/messages";
import { cn } from "@/lib/utils";

export function MessageThread({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: {
    id: string;
    body: string;
    createdAt: string;
    author: string;
    own: boolean;
  }[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const markedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    if (markedRef.current) return;
    markedRef.current = true;
    markConversationRead(conversationId).catch(() => {});
  }, [conversationId]);

  async function handleSend() {
    if (text.trim().length < 1) return;
    setPending(true);
    setError(null);
    try {
      await sendMessage(conversationId, text);
      setText("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send message.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.own ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5",
                m.own
                  ? "bg-brand-600 text-white"
                  : "bg-zinc-100 text-zinc-800",
              )}
            >
              {!m.own && (
                <p className="mb-1 text-[11px] font-bold text-brand-700">
                  {m.author}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{m.body}</p>
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  m.own ? "text-brand-100" : "text-zinc-400",
                )}
              >
                {new Date(m.createdAt).toLocaleString("en-US", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-200 p-4">
        <div className="flex gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Type a reply..."
            className="flex-1 resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={handleSend}
            disabled={pending || text.trim().length < 1}
            className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}