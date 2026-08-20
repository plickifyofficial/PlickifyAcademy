"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildMessengerUrl,
  buildWhatsAppUrl,
  isChatOnline,
} from "@/lib/floating";
import { logContactEvent, submitOfflineMessage } from "@/lib/actions/contact";
import type {
  ContactSettingsContent,
  QuickReply,
} from "@/lib/content-schema";

type Msg = { id: number; from: "bot" | "user"; text: string };
type Mode = "chat" | "handoff" | "offline-form" | "sent";

let nextId = 1;

export function LiveChatWidget({
  settings,
  onClose,
}: {
  settings: ContactSettingsContent;
  onClose: () => void;
}) {
  const online = isChatOnline(settings);
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: nextId++,
      from: "bot",
      text: online ? settings.welcomeMessage : settings.offlineMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>(online ? "chat" : "offline-form");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, mode]);

  const pushBot = (text: string, delay = 450) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: nextId++, from: "bot", text }]);
    }, delay);
  };

  function handleQuickReply(q: QuickReply) {
    setMessages((m) => [...m, { id: nextId++, from: "user", text: q.label }]);
    if (q.label === "Talk to Support") {
      pushBot(settings.supportMessage, 500);
      setMode("handoff");
    } else {
      pushBot(q.reply, 500);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId++, from: "user", text }]);
    pushBot(settings.supportMessage, 600);
    setMode("handoff");
  }

  async function handleOfflineSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await submitOfflineMessage(form);
    setPending(false);
    if (res?.error) return;
    setMode("sent");
  }

  const handoffUrl = (() => {
    const tryTarget = () => {
      if (
        settings.handoffTarget === "whatsapp" &&
        settings.whatsappEnabled &&
        settings.whatsappNumber.trim()
      ) {
        return {
          href: buildWhatsAppUrl(
            settings.whatsappNumber,
            settings.whatsappMessage,
          ),
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
          href: buildWhatsAppUrl(
            settings.whatsappNumber,
            settings.whatsappMessage,
          ),
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

  const quickChips: QuickReply[] = [
    ...settings.quickReplies,
    ...(settings.handoffEnabled
      ? [{ label: "Talk to Support", reply: settings.supportMessage }]
      : []),
  ];

  const track = (type: string, label: string) =>
    void logContactEvent(type, label, window.location.pathname);

  const inputClass =
    "h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="z-chat-widget fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:max-w-[calc(100vw-1.5rem)]">
      <div className="safe-bottom flex h-[min(72vh,600px)] flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:h-[520px] sm:rounded-2xl">
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-3 text-white">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-lg">
            {settings.botAvatarUrl ? (
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
            <p className="truncate text-sm font-bold">{settings.botName}</p>
            <p className="text-xs text-white/85">
              {online ? "We're Online" : "We're currently offline"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
          >
            <i className="fa-solid fa-xmark text-lg" />
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
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.from === "user"
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {mode === "chat" && (
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
                onClick={() =>
                  track("handoff_click", handoffUrl.label)
                }
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
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className={inputClass}
              aria-label="Your email"
            />
            <textarea
              placeholder="Your message"
              rows={2}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
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
              disabled={mode === "sent"}
              className={`${inputClass} flex-1`}
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={mode === "sent"}
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