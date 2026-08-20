"use client";

import { useState } from "react";
import { buildMessengerUrl, buildWhatsAppUrl } from "@/lib/floating";
import { logContactEvent } from "@/lib/actions/contact";
import type { ContactSettingsContent } from "@/lib/content-schema";

export function FloatingContact({
  settings,
  bottom,
  onOpenChat,
  onOpenChange,
}: {
  settings: ContactSettingsContent;
  bottom: number;
  onOpenChat: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  const whatsappUrl =
    settings.whatsappEnabled && settings.whatsappNumber.trim()
      ? buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage)
      : "";
  const messengerUrl =
    settings.messengerEnabled && settings.messengerUrl.trim()
      ? buildMessengerUrl(settings.messengerUrl)
      : "";

  if (
    !settings.enabled ||
    (!whatsappUrl && !messengerUrl && !settings.liveChatEnabled)
  ) {
    return null;
  }

  const track = (type: string, label: string) =>
    void logContactEvent(type, label, window.location.pathname);

  const itemClass =
    "flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-zinc-50 active:scale-[0.98]";

  return (
    <div
      className="z-floating fixed right-4 sm:right-[30px]"
      style={{ bottom }}
    >
      {open && (
        <div className="z-contact-menu absolute bottom-full right-0 mb-3 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", settings.whatsappLabel)}
              className={itemClass}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-lg text-white">
                <i className="fa-brands fa-whatsapp" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-900">
                  {settings.whatsappLabel}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  Chat on WhatsApp
                </span>
              </span>
            </a>
          )}

          {messengerUrl && (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("messenger_click", settings.messengerLabel)}
              className={itemClass}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-lg text-white">
                <i className="fa-brands fa-facebook-messenger" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-900">
                  {settings.messengerLabel}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  Chat on Messenger
                </span>
              </span>
            </a>
          )}

          {settings.liveChatEnabled && (
            <button
              type="button"
              onClick={() => {
                track("live_chat_open", settings.botName);
                setOpen(false);
                onOpenChange(false);
                onOpenChat();
              }}
              className={`${itemClass} w-full text-left`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg text-white">
                <i className="fa-solid fa-headset" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-zinc-900">
                  Live Chat
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  Chat with {settings.botName}
                </span>
              </span>
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        aria-label="Contact Plickify Academy"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          onOpenChange(!open);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <i
          className={`fa-solid ${open ? "fa-xmark" : "fa-comment-dots"} transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
    </div>
  );
}