"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/actions/contact";
import type { ContactContent } from "@/lib/content-schema";

const SUBJECTS = [
  "Course Inquiry",
  "Admission",
  "Payment Issue",
  "Digital Product",
  "Technical Support",
  "Partnership",
  "General Question",
];

export function ContactForm({
  content,
}: {
  content: ContactContent;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "দয়া করে আপনার নাম লিখুন।";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "দয়া করে একটি সঠিক email লিখুন।";
    if (message.trim().length < 5)
      e.message = "দয়া করে আপনার মেসেজ লিখুন।";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;
    setPending(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("subject", subject);
    fd.set("message", message);
    const result = await submitContactMessage(fd);
    setPending(false);
    if (result?.error) {
      setErrors({ form: result.error });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-zinc-100 bg-white p-10 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          <i className="fa-solid fa-circle-check" />
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-zinc-900">
          {content.successTitle}
        </h3>
        <p className="mt-2 text-zinc-500">{content.successDesc}</p>
        <button
          onClick={() => {
            setDone(false);
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setConsent(false);
            setErrors({});
          }}
          className="mt-6 rounded-full border border-brand-300 bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          আরেকটি মেসেজ পাঠান
        </button>
      </div>
    );
  }

  const inputClass = (hasError?: string) =>
    `w-full rounded-xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-zinc-200 focus:border-brand-500 focus:ring-brand-100"
    }`;

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl shadow-brand-600/5 sm:p-8">
      <h3 className="text-xl font-bold text-zinc-900">{content.formTitle}</h3>
      <p className="mt-1 text-sm text-zinc-500">{content.formDesc}</p>

      {errors.form && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <i className="fa-solid fa-circle-exclamation" />
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              আপনার নাম *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার পূর্ণ নাম লিখুন"
              className={inputClass(errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার email লিখুন"
              className={inputClass(errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXXXXXXXX"
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
              বিষয়ের ধরন
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass()}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
            আপনার মেসেজ *
          </label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="আপনার প্রশ্ন বা সমস্যাটি বিস্তারিত লিখুন..."
            className={`${inputClass(errors.message)} resize-none`}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600">{errors.message}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-600"
          />
          আমি নিশ্চিত করছি যে উপরের তথ্য সঠিক।
        </label>

        <button
          type="submit"
          disabled={pending || !consent}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <i className="fa-solid fa-paper-plane text-xs" />
          {pending ? "পাঠানো হচ্ছে..." : "মেসেজ পাঠান"}
        </button>
      </form>
    </div>
  );
}