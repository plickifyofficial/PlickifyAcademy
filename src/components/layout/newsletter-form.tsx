"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm({
  title,
  placeholder,
  buttonText,
}: {
  title: string;
  placeholder: string;
  buttonText: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await subscribeNewsletter(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setMessage("Thank you for subscribing!");
        form.reset();
      }
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="Newsletter">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-3 flex overflow-hidden rounded-full border border-white/15 bg-white/5">
        <input
          type="email"
          name="email"
          required
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60 sm:px-6"
        >
          {pending ? "..." : buttonText}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {message && <p className="mt-2 text-xs text-emerald-400">{message}</p>}
    </form>
  );
}