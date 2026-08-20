"use client";

import { useState } from "react";
import { updatePreferences } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/toaster";

export function SettingsForm({
  emailNotifications,
  pushNotifications,
  marketingOptIn,
}: {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingOptIn: boolean;
}) {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState(emailNotifications);
  const [push, setPush] = useState(pushNotifications);
  const [marketing, setMarketing] = useState(marketingOptIn);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    if (email) fd.set("email_notifications", "on");
    if (push) fd.set("push_notifications", "on");
    if (marketing) fd.set("marketing_opt_in", "on");
    const result = await updatePreferences(fd);
    setPending(false);
    if (result?.error) {
      showToast(result.error, "error");
    } else {
      showToast("Settings saved");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <h2 className="font-semibold text-zinc-900">Notifications</h2>
      <div className="mt-4 space-y-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-800">
              Email notifications
            </p>
            <p className="text-xs text-zinc-500">
              Course updates, offers and important notices
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={email}
            onClick={() => setEmail((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              email ? "bg-brand-600" : "bg-zinc-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                email ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-800">
              In-app notifications
            </p>
            <p className="text-xs text-zinc-500">
              Alerts for messages, grades and live classes
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={push}
            onClick={() => setPush((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              push ? "bg-brand-600" : "bg-zinc-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                push ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-800">
              Marketing emails
            </p>
            <p className="text-xs text-zinc-500">
              New course and discount announcements
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={marketing}
            onClick={() => setMarketing((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              marketing ? "bg-brand-600" : "bg-zinc-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                marketing ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}