"use client";

import { useState } from "react";
import { faqs } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-zinc-900">{q}</span>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition-all",
            open
              ? "rotate-45 bg-brand-600 text-white"
              : "bg-brand-50 text-brand-600",
          )}
        >
          <i className="fa-solid fa-plus" />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-500">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const left = faqs.filter((_, i) => i % 2 === 0);
  const right = faqs.filter((_, i) => i % 2 === 1);

  return (
    <section id="faq" className="bg-zinc-50/70 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            সাধারণ কিছু প্রশ্ন
          </h2>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="space-y-4">
            {left.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
          <div className="space-y-4">
            {right.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}