"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { useToast } from "@/components/ui/toaster";

export function NewsletterCta({
  variant = "page",
  source = "blog",
}: {
  variant?: "page" | "card";
  source?: string;
}) {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("email", e.currentTarget.email.value);
    fd.set("source", source);
    const res = await subscribeNewsletter(fd);
    setPending(false);
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    setDone(true);
  }

  if (variant === "card") {
    return (
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-blue-50 p-5">
        <h3 className="text-base font-bold text-brand-900">
          Weekly Digital Skills Update
        </h3>
        <p className="mt-1 text-sm text-zinc-600">
          AI, Freelancing এবং Digital World-এর গুরুত্বপূর্ণ tips সরাসরি আপনার
          inbox-এ।
        </p>
        {done ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <i className="fa-solid fa-circle-check" /> Subscribed! Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="Your email"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {pending ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-blue-50 to-white px-6 py-12 text-center sm:px-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-bold tracking-wide text-brand-700">
            <i className="fa-solid fa-envelope-open-text" /> NEWSLETTER
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-extrabold text-zinc-900 sm:text-3xl">
            সপ্তাহের সেরা Digital Tips পান
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-600">
            নতুন tutorial, AI tools, freelancing tips এবং useful resources মিস
            করবেন না।
          </p>
          {done ? (
            <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-green-700 shadow-sm">
              <i className="fa-solid fa-circle-check" /> Subscribed! Check your inbox.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="আপনার Email"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={pending}
                className="shrink-0 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700"
              >
                {pending ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-zinc-500">
            No spam. শুধু useful content.
          </p>
        </div>
      </div>
    </section>
  );
}