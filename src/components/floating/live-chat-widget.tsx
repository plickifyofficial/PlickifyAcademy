"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildMessengerUrl,
  buildWhatsAppUrl,
  isChatOnline,
} from "@/lib/floating";
import { logContactEvent, submitOfflineMessage } from "@/lib/actions/contact";
import { rateAiMessage } from "@/lib/actions/ai";
import { renderChatMessage } from "@/lib/chat-format";
import type {
  ContactSettingsContent,
  QuickReply,
} from "@/lib/content-schema";

type Msg = {
  id: number;
  from: "bot" | "user";
  text: string;
  serverId?: string | null;
  feedback?: "up" | "down" | null;
};
type Mode = "chat" | "handoff" | "offline-form" | "sent";

let nextId = 1;
const SESSION_KEY = "plickify_ai_session";

type AiInfo = {
  name: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
};

export function LiveChatWidget({
  settings,
  onClose,
  ai = null,
}: {
  settings: ContactSettingsContent;
  onClose: () => void;
  ai?: AiInfo | null;
}) {
  const online = isChatOnline(settings);
  const aiMode = Boolean(ai);
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: nextId++,
      from: "bot",
      text: ai ? ai.welcomeMessage : online ? settings.welcomeMessage : settings.offlineMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>(online ? "chat" : "offline-form");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [pending, setPending] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const sessionRef = useRef<string>("");

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

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, mode, aiThinking]);

  const pushBot = (text: string, delay = 450) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId++, from: "bot", text }]);
    }, delay);
  };

  async function sendAi(text: string) {
    setAiThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionRef.current, message: text }),
      });
      const data = (await res.json()) as {
        reply?: string;
        messageId?: string | null;
        error?: string;
      };
      const reply =
        data.reply || data.error || "দুঃখিত, উত্তর পাওয়া যায়নি।";
      setMessages((m) => [
        ...m,
        { id: nextId++, from: "bot", text: reply, serverId: data.messageId ?? null },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId++, from: "bot", text: "ইন্টারনেট সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।" },
      ]);
    } finally {
      setAiThinking(false);
    }
  }

  function handleQuickReply(q: QuickReply) {
    setMessages((m) => [...m, { id: nextId++, from: "user", text: q.label }]);
    if (q.label === "Talk to Support") {
      pushBot(settings.supportMessage, 500);
      setMode("handoff");
    } else {
      pushBot(q.reply, 500);
    }
  }

  async function handleAiChip(text: string) {
    setMessages((m) => [...m, { id: nextId++, from: "user", text }]);
    await sendAi(text);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId++, from: "user", text }]);
    if (aiMode) {
      void sendAi(text);
    } else {
      pushBot(settings.supportMessage, 600);
      setMode("handoff");
    }
  }

  async function handleOfflineSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await submitOfflineMessage(form);
    setPending(false);
    if (res?.error) return;
    setMode("sent");
  }

  async function rate(m: Msg, feedback: "up" | "down") {
    if (!m.serverId || m.feedback === feedback) return;
    setMessages((prev) =>
      prev.map((x) => (x === m ? { ...x, feedback } : x)),
    );
    await rateAiMessage(m.serverId, feedback);
  }

  const handoffUrl = (() => {
    const tryTarget = () => {
      if (
        settings.handoffTarget === "whatsapp" &&
        settings.whatsappEnabled &&
        settings.whatsappNumber.trim()
      ) {
        return {
          href: buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage),
          label: "WhatsApp Us",
          icon: "fa-brands fa-whatsapp",
          color: "bg-green-500",
        };
      }
      if (
        settings.handoffTarget === "messenger" &&
        settings.messengerEnabled &&
        settings.messengerUrl.trim()
      ) {
        return {
          href: buildMessengerUrl(settings.messengerUrl),
          label: "Messenger",
          icon: "fa-brands fa-facebook-messenger",
          color: "bg-blue-500",
        };
      }
      if (settings.whatsappEnabled && settings.whatsappNumber.trim()) {
        return {
          href: buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage),
          label: "WhatsApp Us",
          icon: "fa-brands fa-whatsapp",
          color: "bg-green-500",
        };
      }
      if (settings.messengerEnabled && settings.messengerUrl.trim()) {
        return {
          href: buildMessengerUrl(settings.messengerUrl),
          label: "Messenger",
          icon: "fa-brands fa-facebook-messenger",
          color: "bg-blue-500",
        };
      }
      return null;
    };
    return tryTarget();
  })();

  const track = (type: string, label: string) =>
    void logContactEvent(type, label, window.location.pathname);

  const inputClass =
    "h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  const headerTitle = aiMode ? ai!.name : settings.botName;
  const headerSubtitle = aiMode
    ? "AI Assistant • Online"
    : online
      ? "We're Online"
      : "We're currently offline";

  // AI suggested chips + a support escalation chip. Existing rule-based quick replies otherwise.
  const aiChips = ai
    ? [
        ...ai.suggestedQuestions.map((q) => ({ label: q })),
        ...(settings.handoffEnabled
          ? [{ label: "Talk to Support" }]
          : []),
      ]
    : [];
  const quickChips: QuickReply[] = ai
    ? []
    : [
        ...settings.quickReplies,
        ...(settings.handoffEnabled
          ? [{ label: "Talk to Support", reply: settings.supportMessage }]
          : []),
      ];

  return (
    <div className="z-chat-widget fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:max-w-[calc(100vw-1.5rem)]">
      <div className="safe-bottom flex h-[min(72vh,600px)] flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:h-[520px] sm:rounded-2xl">
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-3 text-white">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-lg">
            {aiMode ? (
              <i className="fa-solid fa-robot" />
            ) : settings.botAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.botAvatarUrl}
                alt={settings.botName}
                className="h-full w-full object-cover"
              />
            ) : (
              <i className="fa-solid fa-robot" />
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                online ? "bg-green-400" : "bg-zinc-400"
              }`}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{headerTitle}</p>
            <p className="text-xs text-white/85">{headerSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white"
          >
            <i className="fa-solid fa-xmark text-base" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.from === "user" ? (
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm text-white">
                  {m.text}
                </div>
              ) : aiMode ? (
                <div className="max-w-[85%]">
                  <div
                    className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-2.5 text-sm leading-relaxed text-zinc-800"
                    dangerouslySetInnerHTML={{ __html: renderChatMessage(m.text) }}
                  />
                  {m.serverId && (
                    <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        onClick={() => rate(m, "up")}
                        aria-label="Helpful"
                        className={
                          m.feedback === "up"
                            ? "rounded px-1.5 py-0.5 text-xs text-emerald-600"
                            : "rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:text-emerald-600"
                        }
                      >
                        <i className="fa-solid fa-thumbs-up" />
                      </button>
                      <button
                        onClick={() => rate(m, "down")}
                        aria-label="Not helpful"
                        className={
                          m.feedback === "down"
                            ? "rounded px-1.5 py-0.5 text-xs text-red-500"
                            : "rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:text-red-500"
                        }
                      >
                        <i className="fa-solid fa-thumbs-down" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800">
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {aiThinking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {aiMode && mode === "chat" && aiChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {aiChips.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleAiChip(q.label)}
                  className="rounded-full border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 active:scale-95"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {!aiMode && mode === "chat" && (
            <div className="flex flex-wrap gap-2">
              {quickChips.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuickReply(q)}
                  className="rounded-full border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 active:scale-95"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {mode === "handoff" && handoffUrl && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500">
                Talk to our support team:
              </p>
              <a
                href={handoffUrl.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("handoff_click", handoffUrl.label)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
              >
                <i className={handoffUrl.icon} />
                {handoffUrl.label}
              </a>
            </div>
          )}

          {mode === "sent" && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Thank you! Your message has been received — we will get back to
              you soon.
            </div>
          )}
        </div>

        {mode === "offline-form" ? (
          <form
            onSubmit={handleOfflineSubmit}
            className="space-y-2 border-t border-zinc-200 bg-white p-3"
          >
            <input
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              aria-label="Your name"
            />
            <input
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
              aria-label="Your email"
            />
            <textarea
              placeholder="Your message"
              rows={2}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className={`${inputClass} resize-none py-2.5`}
              aria-label="Your message"
            />
            <button
              type="submit"
              disabled={pending}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Sending..." : "Send Message"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={mode === "sent" || aiThinking}
              className={`${inputClass} flex-1`}
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={mode === "sent" || aiThinking}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
