"use client";

import { useEffect, useRef, useState } from "react";
import { rateAiMessage } from "@/lib/actions/ai";
import { cn } from "@/lib/utils";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  id?: string | null;
  feedback?: "up" | "down" | null;
};

type Props = {
  name: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
};

const SESSION_KEY = "plickify_ai_session";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal safe markdown: [text](url) links, **bold**, line breaks. */
function renderMessage(content: string) {
  const escaped = escapeHtml(content);
  const withLinks = escaped.replace(
    /\[([^\]]{1,80})\]\((\/[^)\s]{1,300}|https?:\/\/[^)\s]{1,300})\)/g,
    (_m, text: string, url: string) =>
      `<a href="${url}" class="font-semibold underline decoration-2 underline-offset-2 hover:opacity-80" ${url.startsWith("/") ? "" : 'target="_blank" rel="noopener noreferrer"'}>${text}</a>`,
  );
  return withLinks
    .replace(/\*\*([^*\n]{1,200})\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export function AiChatWidget({ name, welcomeMessage, suggestedQuestions }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const sessionRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      let sid = localStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(SESSION_KEY, sid);
      }
      sessionRef.current = sid;
    } catch {
      sessionRef.current = `s_${Date.now()}`;
    }
  }, []);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionRef.current, message }),
      });
      const data = (await res.json()) as {
        reply?: string;
        messageId?: string | null;
        error?: string;
      };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || data.error || "দুঃখিত, উত্তর পাওয়া যায়নি।",
          id: data.messageId ?? null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ইন্টারনেট সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function rate(msg: ChatMsg, feedback: "up" | "down") {
    if (!msg.id || msg.feedback === feedback) return;
    setMessages((prev) =>
      prev.map((m) => (m === msg ? { ...m, feedback } : m)),
    );
    await rateAiMessage(msg.id, feedback);
  }

  const showSuggestions = messages.length === 0;

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={cn(
          "fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95",
          open ? "bg-zinc-800" : "bg-gradient-to-br from-brand-500 to-brand-700",
        )}
      >
        <i className={cn("fa-solid text-xl", open ? "fa-xmark" : "fa-robot")} />
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-[88px] right-5 z-[70] flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-700 to-brand-900 px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <i className="fa-solid fa-robot" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{name}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-brand-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-zinc-50 p-3">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-zinc-700 shadow-sm">
              <span dangerouslySetInnerHTML={{ __html: renderMessage(welcomeMessage) }} />
            </div>

            {showSuggestions &&
              suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="block max-w-[90%] rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-left text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                >
                  {q}
                </button>
              ))}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="group max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-zinc-700 shadow-sm">
                    <span dangerouslySetInnerHTML={{ __html: renderMessage(m.content) }} />
                  </div>
                  {m.id && (
                    <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => rate(m, "up")}
                        aria-label="Helpful"
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-xs",
                          m.feedback === "up"
                            ? "bg-emerald-100 text-emerald-600"
                            : "text-zinc-400 hover:text-emerald-600",
                        )}
                      >
                        <i className="fa-solid fa-thumbs-up" />
                      </button>
                      <button
                        onClick={() => rate(m, "down")}
                        aria-label="Not helpful"
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-xs",
                          m.feedback === "down"
                            ? "bg-red-100 text-red-500"
                            : "text-zinc-400 hover:text-red-500",
                        )}
                      >
                        <i className="fa-solid fa-thumbs-down" />
                      </button>
                    </div>
                  )}
                </div>
              ),
            )}

            {sending && (
              <div className="flex max-w-[60%] items-center gap-1.5 rounded-2xl rounded-tl-sm border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-zinc-200 bg-white p-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              maxLength={1000}
              className="min-h-10 flex-1 rounded-full border border-zinc-300 px-4 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700 disabled:opacity-40"
            >
              <i className={cn("fa-solid", sending ? "fa-spinner fa-spin" : "fa-paper-plane")} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
