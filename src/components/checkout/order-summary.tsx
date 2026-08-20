"use client";

import { useState } from "react";

export function OrderSummary({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 pb-4 pt-6 text-left lg:pointer-events-none lg:pb-4 lg:pt-6"
        aria-expanded={open}
        tabIndex={0}
      >
        <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
        <i
          className={`fa-solid fa-chevron-down text-sm text-zinc-400 transition-transform lg:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={open ? "block px-6 pb-6" : "hidden px-6 pb-6 lg:block"}>
        {children}
      </div>
    </div>
  );
}