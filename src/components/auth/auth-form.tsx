"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; message?: string }>;
};

export function AuthForm({ mode, action }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);
    setPending(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success && result.message) {
      setSuccess(result.message);
    } else if (!result?.error) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label
            htmlFor="full_name"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            সম্পূর্ণ নাম
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="আপনার নাম"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          ইমেইল
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          পাসওয়ার্ড
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "অপেক্ষা করুন..."
          : mode === "login"
            ? "লগইন করুন"
            : "সাইন আপ করুন"}
      </button>
    </form>
  );
}
