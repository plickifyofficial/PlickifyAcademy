"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import {
  deleteContactMessage,
  markContactMessageRead,
  saveContactSettings,
  updateContactMessageStatus,
} from "@/lib/actions/contact";
import type {
  ContactSettingsContent,
  BusinessHour,
  QuickReply,
} from "@/lib/content-schema";

type EventItem = {
  event_type: string;
  label: string | null;
  path: string | null;
  created_at: string;
};
type MsgItem = {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  status: string;
  is_read: boolean;
  created_at: string;
};

const TABS = [
  { id: "buttons", label: "Buttons & Placement", icon: "fa-solid fa-circle-dot" },
  { id: "whatsapp", label: "WhatsApp", icon: "fa-brands fa-whatsapp" },
  { id: "messenger", label: "Messenger", icon: "fa-brands fa-facebook-messenger" },
  { id: "chat", label: "Live Chat", icon: "fa-solid fa-headset" },
  { id: "hours", label: "Availability", icon: "fa-solid fa-clock" },
  { id: "analytics", label: "Analytics", icon: "fa-solid fa-chart-column" },
  { id: "messages", label: "Offline Messages", icon: "fa-solid fa-envelope" },
];

const PLACEMENT_KEYS: { key: keyof ContactSettingsContent["placement"]; label: string }[] = [
  { key: "all", label: "Entire website" },
  { key: "home", label: "Homepage" },
  { key: "courses", label: "Course pages" },
  { key: "products", label: "Product pages" },
  { key: "blog", label: "Blog" },
  { key: "dashboard", label: "Student dashboard" },
  { key: "checkout", label: "Checkout" },
  { key: "pages", label: "About, contact & legal pages" },
];

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-[#dcdcde] bg-[#f9f9f9] p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="wp-checkbox mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#1d2327]">{label}</span>
        {hint && <span className="block text-xs text-[#646970]">{hint}</span>}
      </span>
    </label>
  );
}

export function ContactSystemPanel({
  settings,
  eventCounts,
  recentEvents,
  messages,
}: {
  settings: ContactSettingsContent;
  eventCounts: { type: string; count: number }[];
  recentEvents: EventItem[];
  messages: MsgItem[];
}) {
  const [form, setForm] = useState<ContactSettingsContent>({
    ...settings,
    placement: { ...settings.placement },
    quickReplies: settings.quickReplies.map((q) => ({ ...q })),
    businessHours: settings.businessHours.map((h) => ({ ...h })),
  });
  const [tab, setTab] = useState("buttons");
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  function set<K extends keyof ContactSettingsContent>(
    key: K,
    value: ContactSettingsContent[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setHour(i: number, patch: Partial<BusinessHour>) {
    setForm((f) => ({
      ...f,
      businessHours: f.businessHours.map((h, idx) =>
        idx === i ? { ...h, ...patch } : h,
      ),
    }));
  }

  function setReply(i: number, patch: Partial<QuickReply>) {
    setForm((f) => ({
      ...f,
      quickReplies: f.quickReplies.map((q, idx) =>
        idx === i ? { ...q, ...patch } : q,
      ),
    }));
  }

  async function save() {
    setPending(true);
    const res = await saveContactSettings(JSON.stringify(form));
    setPending(false);
    if (res?.error) return showToast(res.error, "error");
    showToast("Contact system settings saved.");
    router.refresh();
  }

  const input = "wp-input";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-[#2271b1] bg-[#2271b1] text-white"
                : "border-[#dcdcde] bg-white text-[#3c434a] hover:bg-zinc-50"
            }`}
          >
            <i className={t.icon} />
            {t.label}
          </button>
        ))}
        <button
          onClick={save}
          disabled={pending}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2271b1] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#135e96] disabled:opacity-60"
        >
          <i className="fa-solid fa-floppy-disk" />
          {pending ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {tab === "buttons" && (
        <div className="space-y-6">
          <div className="wp-panel">
            <div className="wp-panel-header">Floating Buttons</div>
            <div className="wp-panel-body grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Toggle
                label="Floating contact button"
                hint="Show the 💬 button on the website."
                checked={form.enabled}
                onChange={(v) => set("enabled", v)}
              />
              <Toggle
                label="Back to top button"
                hint="Show the circular ↑ button after scrolling."
                checked={form.backToTopEnabled}
                onChange={(v) => set("backToTopEnabled", v)}
              />
            </div>
          </div>

          <div className="wp-panel">
            <div className="wp-panel-header">Where it appears</div>
            <p className="px-4 pb-3 text-xs text-[#646970]">
              &quot;Entire website&quot; is the master switch. Untick a section to
              hide the floating contact system there (e.g. checkout).
            </p>
            <div className="wp-panel-body grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PLACEMENT_KEYS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-center gap-2 text-sm text-[#3c434a]"
                >
                  <input
                    type="checkbox"
                    checked={form.placement[p.key]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        placement: { ...f.placement, [p.key]: e.target.checked },
                      }))
                    }
                    className="wp-checkbox"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "whatsapp" && (
        <div className="wp-panel">
          <div className="wp-panel-header">
            <i className="fa-brands fa-whatsapp text-[#25d366]" /> WhatsApp
          </div>
          <div className="wp-panel-body grid grid-cols-1 gap-4">
            <Toggle
              label="Enable WhatsApp"
              checked={form.whatsappEnabled}
              onChange={(v) => set("whatsappEnabled", v)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="wp-label">WhatsApp Number</label>
                <input
                  value={form.whatsappNumber}
                  onChange={(e) => set("whatsappNumber", e.target.value)}
                  placeholder="e.g. +880 1XXX-XXXXXX"
                  className={input}
                />
              </div>
              <div>
                <label className="wp-label">Button Label</label>
                <input
                  value={form.whatsappLabel}
                  onChange={(e) => set("whatsappLabel", e.target.value)}
                  className={input}
                />
              </div>
            </div>
            <div>
              <label className="wp-label">Default Message</label>
              <textarea
                value={form.whatsappMessage}
                onChange={(e) => set("whatsappMessage", e.target.value)}
                rows={3}
                className={input}
              />
              <p className="mt-1 text-xs text-[#646970]">
                Pre-filled when a visitor opens your WhatsApp chat.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "messenger" && (
        <div className="wp-panel">
          <div className="wp-panel-header">
            <i className="fa-brands fa-facebook-messenger text-[#0084ff]" /> Messenger
          </div>
          <div className="wp-panel-body grid grid-cols-1 gap-4">
            <Toggle
              label="Enable Messenger"
              checked={form.messengerEnabled}
              onChange={(v) => set("messengerEnabled", v)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="wp-label">Messenger URL or Page ID</label>
                <input
                  value={form.messengerUrl}
                  onChange={(e) => set("messengerUrl", e.target.value)}
                  placeholder="https://m.me/YourPage or YourPageID"
                  className={input}
                />
                <p className="mt-1 text-xs text-[#646970]">
                  A full URL is used as-is; a Page ID opens m.me/&lt;id&gt;. No
                  hardcoded links in source.
                </p>
              </div>
              <div>
                <label className="wp-label">Button Label</label>
                <input
                  value={form.messengerLabel}
                  onChange={(e) => set("messengerLabel", e.target.value)}
                  className={input}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "chat" && (
        <div className="space-y-6">
          <div className="wp-panel">
            <div className="wp-panel-header">
              <i className="fa-solid fa-headset text-[#2271b1]" /> Live Chat Bot
            </div>
            <div className="wp-panel-body grid grid-cols-1 gap-4">
              <Toggle
                label="Enable Live Chat"
                hint="Lazily loaded — the chat widget only loads after a visitor clicks it."
                checked={form.liveChatEnabled}
                onChange={(v) => set("liveChatEnabled", v)}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="wp-label">Bot Name</label>
                  <input
                    value={form.botName}
                    onChange={(e) => set("botName", e.target.value)}
                    className={input}
                  />
                </div>
                <div>
                  <label className="wp-label">Bot Avatar URL</label>
                  <input
                    value={form.botAvatarUrl}
                    onChange={(e) => set("botAvatarUrl", e.target.value)}
                    placeholder="https://... (optional)"
                    className={input}
                  />
                </div>
              </div>
              <div>
                <label className="wp-label">Welcome Message</label>
                <textarea
                  value={form.welcomeMessage}
                  onChange={(e) => set("welcomeMessage", e.target.value)}
                  rows={2}
                  className={input}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="wp-label">Support / Fallback Message</label>
                  <textarea
                    value={form.supportMessage}
                    onChange={(e) => set("supportMessage", e.target.value)}
                    rows={2}
                    className={input}
                  />
                </div>
                <div>
                  <label className="wp-label">Offline Message</label>
                  <textarea
                    value={form.offlineMessage}
                    onChange={(e) => set("offlineMessage", e.target.value)}
                    rows={2}
                    className={input}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="wp-panel">
            <div className="wp-panel-header">Quick Replies</div>
            <div className="wp-panel-body space-y-3">
              {form.quickReplies.map((q, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#dcdcde] p-3"
                >
                  <div className="flex gap-2">
                    <input
                      value={q.label}
                      onChange={(e) => setReply(i, { label: e.target.value })}
                      placeholder="Button label"
                      className={input}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          quickReplies: f.quickReplies.filter((_, idx) => idx !== i),
                        }))
                      }
                      aria-label="Remove quick reply"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#c3c4c7] text-[#d63638] hover:bg-red-50"
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                  <textarea
                    value={q.reply}
                    onChange={(e) => setReply(i, { reply: e.target.value })}
                    placeholder="Bot reply"
                    rows={2}
                    className={`${input} mt-2`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    quickReplies: [...f.quickReplies, { label: "", reply: "" }],
                  }))
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-[#c3c4c7] px-4 py-2 text-sm font-semibold text-[#2271b1] hover:bg-[#f0f6fc]"
              >
                <i className="fa-solid fa-plus" /> Add quick reply
              </button>
            </div>
          </div>

          <div className="wp-panel">
            <div className="wp-panel-header">Human Handoff</div>
            <div className="wp-panel-body grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Toggle
                label="Allow talk to a human"
                hint="Shows a handoff button when the bot can't answer."
                checked={form.handoffEnabled}
                onChange={(v) => set("handoffEnabled", v)}
              />
              <div>
                <label className="wp-label">Handoff target</label>
                <select
                  value={form.handoffTarget}
                  onChange={(e) =>
                    set("handoffTarget", e.target.value as ContactSettingsContent["handoffTarget"])
                  }
                  className={input}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="messenger">Messenger</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "hours" && (
        <div className="space-y-6">
          <div className="wp-panel">
            <div className="wp-panel-header">Chat Availability</div>
            <div className="wp-panel-body grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Toggle
                label="Always online"
                hint="Chat is always available (green status)."
                checked={form.availability === "always"}
                onChange={(v) => set("availability", v ? "always" : "hours")}
              />
              <Toggle
                label="Business hours only"
                hint="Show offline + leave-a-message outside the hours below."
                checked={form.availability === "hours"}
                onChange={(v) => set("availability", v ? "hours" : "always")}
              />
            </div>
          </div>

          <div className="wp-panel">
            <div className="wp-panel-header">Business Hours</div>
            <div className="wp-panel-body space-y-2">
              {form.businessHours.map((h, i) => (
                <div
                  key={h.day}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 sm:grid-cols-[auto_8rem_8rem]"
                >
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => setHour(i, { enabled: e.target.checked })}
                    className="wp-checkbox"
                    aria-label={`${h.label} open`}
                  />
                  <span className="text-sm font-semibold text-[#1d2327]">
                    {h.label}
                  </span>
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) => setHour(i, { open: e.target.value })}
                    className={input}
                    aria-label={`${h.label} opens at`}
                  />
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) => setHour(i, { close: e.target.value })}
                    className={input}
                    aria-label={`${h.label} closes at`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="wp-panel">
            <div className="wp-panel-header">Event Counts</div>
            <div className="wp-panel-body">
              {eventCounts.length === 0 ? (
                <p className="text-sm text-[#646970]">
                  No events recorded yet. Clicks are tracked once visitors use the
                  floating buttons.
                </p>
              ) : (
                <div className="divide-y divide-[#f0f0f1]">
                  {eventCounts.map((e) => (
                    <div
                      key={e.type}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="font-medium capitalize text-[#1d2327]">
                        {e.type.replace(/_/g, " ")}
                      </span>
                      <span className="rounded-full bg-[#f0f6fc] px-2.5 py-0.5 text-xs font-bold text-[#2271b1]">
                        {e.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="wp-panel">
            <div className="wp-panel-header">Recent Events</div>
            <div className="wp-panel-body max-h-96 overflow-y-auto">
              {recentEvents.length === 0 ? (
                <p className="text-sm text-[#646970]">No events yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentEvents.slice(0, 20).map((e, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[#f0f0f1] px-3 py-2"
                    >
                      <p className="text-xs font-semibold capitalize text-[#1d2327]">
                        {e.event_type.replace(/_/g, " ")}
                        {e.label ? ` — ${e.label}` : ""}
                      </p>
                      <p className="text-[11px] text-[#646970]">
                        {e.path ?? "—"} ·{" "}
                        {new Date(e.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="wp-panel">
          <div className="wp-panel-header">
            Offline Chat Messages
            <span className="ml-2 rounded-full bg-[#f0f6fc] px-2 py-0.5 text-xs font-bold text-[#2271b1]">
              {messages.length}
            </span>
          </div>
          <div className="wp-panel-body">
            {messages.length === 0 ? (
              <p className="text-sm text-[#646970]">
                No offline chat messages yet. When the chat is offline, visitors
                leave messages here.
              </p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg border p-3 ${
                      m.is_read ? "border-[#f0f0f1]" : "border-[#2271b1]/40 bg-[#f0f6fc]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#1d2327]">
                        {m.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-[#646970]">{m.email}</span>
                      <span className="ml-auto text-xs text-[#646970]">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[#3c434a]">
                      {m.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={m.status}
                        onChange={(e) =>
                          void updateContactMessageStatus(m.id, e.target.value)
                            .then(() => markContactMessageRead(m.id, true))
                            .then(() => router.refresh())
                        }
                        className="wp-input h-9 w-auto min-w-[8rem] py-1 text-xs"
                      >
                        {["New", "In Progress", "Replied", "Closed"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {!m.is_read && (
                        <button
                          onClick={() =>
                            void markContactMessageRead(m.id, true).then(() => router.refresh())
                          }
                          className="rounded-lg border border-[#c3c4c7] px-3 py-1.5 text-xs font-semibold text-[#3c434a] hover:bg-zinc-50"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() =>
                          void deleteContactMessage(m.id).then(() => router.refresh())
                        }
                        className="ml-auto rounded-lg border border-[#c3c4c7] px-3 py-1.5 text-xs font-semibold text-[#d63638] hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}