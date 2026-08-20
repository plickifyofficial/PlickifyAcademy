"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";

type Result = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  price: number;
  level: string | null;
};

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const term = q.trim();
    if (term.length < 2) return;
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("courses")
        .select("id, slug, title, description, cover_image, price, level")
        .eq("is_published", true)
        .eq("visibility", "public")
        .ilike("title", `%${term}%`)
        .order("created_at", { ascending: false })
        .limit(6);
      setResults((data as Result[]) ?? []);
      setLoading(false);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function goToAll() {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/courses?q=${encodeURIComponent(term)}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setQ("");
          setResults([]);
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-label="Search"
        className="hidden h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand-600 md:flex"
      >
        <i className="fa-solid fa-magnifying-glass" />
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow-lg sm:top-20 sm:mx-auto sm:max-w-xl sm:rounded-2xl sm:border sm:border-zinc-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToAll();
          }}
          className="flex items-center gap-3"
        >
          <i className="fa-solid fa-magnifying-glass text-zinc-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-transparent py-2 text-base text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </form>

        {q.trim().length >= 2 && (
          <div className="mt-2 max-h-80 overflow-y-auto border-t border-zinc-100 pt-2">
            {loading ? (
              <p className="px-3 py-4 text-sm text-zinc-500">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-sm text-zinc-500">
                No courses found for “{q.trim()}”.
              </p>
            ) : (
              results.map((r) => (
                <Link
                  key={r.id}
                  href={`/courses/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-100 text-sm font-bold text-brand-700">
                    {r.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.cover_image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      r.title.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {r.title}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {r.description || r.level}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-brand-600">
                    {formatPrice(r.price)}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}

        {q.trim().length >= 2 && !loading && results.length > 0 && (
          <button
            type="button"
            onClick={goToAll}
            className="mt-2 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            View all results
          </button>
        )}
      </div>
    </>
  );
}