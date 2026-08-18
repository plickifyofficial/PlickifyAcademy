"use client";

import { useEffect, useState } from "react";
import type { TestimonialsContent } from "@/lib/content-schema";

export function Testimonials({ content }: { content: TestimonialsContent }) {
  const items = content.items ?? [];
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setPerView(mq.matches ? 3 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / perView));

  useEffect(() => {
    if (index >= totalPages) setIndex(0);
  }, [totalPages, index]);

  function move(dir: number) {
    setIndex((i) => (i + dir + totalPages) % totalPages);
  }

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex items-end justify-between" data-aos="fade-up">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {content.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            {content.title}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => move(-1)}
            aria-label="আগের"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <i className="fa-solid fa-arrow-left text-sm" />
          </button>
          <button
            onClick={() => move(1)}
            aria-label="পরের"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
          >
            <i className="fa-solid fa-arrow-right text-sm" />
          </button>
        </div>
      </div>

      <div className="mt-10 overflow-hidden" data-aos="fade-up" data-aos-delay="100">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((t) => (
            <div
              key={t.name}
              className="shrink-0 px-1.5"
              style={{ width: `${100 / perView}%` }}
            >
              <div className="flex h-full flex-col rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className="fa-solid fa-star text-sm" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-4">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                    <p className="text-xs font-medium text-zinc-500">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
