"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { useToast } from "@/components/ui/toaster";

export function ProfileForm({ currentName }: { currentName: string }) {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(currentName);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.set("full_name", name);
    const result = await updateProfile(fd);
    setPending(false);
    if (result?.error) {
      showToast(result.error, "error");
    } else {
      showToast("প্রোফাইল আপডেট হয়েছে");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <h2 className="font-semibold text-zinc-900">নাম পরিবর্তন</h2>
      <label
        htmlFor="full_name"
        className="mt-4 mb-1 block text-sm font-medium text-zinc-700"
      >
        সম্পূর্ণ নাম
      </label>
      <input
        id="full_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="আপনার নাম"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </button>
    </form>
  );
}