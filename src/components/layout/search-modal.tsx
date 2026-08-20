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
  type: "course" | "product";
};

const POPULAR_SEARCHES = ["AI", "Freelancing", "Design", "Digital Marketing", "Video Editing"];

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
      const [courseRes, productRes] = await Promise.all([
        supabase
          .from("courses")
          .select("id, slug, title, description, cover_image, price, level")
          .eq("is_published", true)
          .eq("visibility", "public")
          .ilike("title", `%${term}%`)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("products")
          .select("id, slug, name, description, cover_image, price")
          .eq("is_published", true)
          .ilike("name", `%${term}%`)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      const merged: Result[] = [
        ...((courseRes.data ?? []) as Result[]).map((c) => ({
          ...c,
          title: c.title,
          type: "course" as const,
        })),
        ...((productRes.data ?? []) as unknown as Result[]).map((p) => ({
          ...p,
          title: (p as unknown as { name: string }).name,
          type: "product" as const,
        })),
      ].slice(0, 6);
      setResults(merged);
      setLoading(false);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function openSearch() {
    setQ("");
    setResults([]);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function goToAll() {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/courses?q=${encodeURIComponent(term)}`);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={openSearch}
        aria-label="Search"
        className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-brand-600"
      >
        <i className="fa-solid fa-magnifying-glass" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 top-0 z-50 flex h-full flex-col bg-white shadow-lg sm:top-20 sm:mx-auto sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:rounded-2xl sm:border sm:border-zinc-200">
            <div className="safe-top flex items-center gap-3 border-b border-zinc-100 p-4">
              <i className="fa-solid fa-magnifying-glass text-zinc-400" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToAll();
                }}
                className="flex-1"
              >
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search courses, products…"
                  className="w-full bg-transparent py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </form>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {q.trim().length < 2 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Popular searches
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQ(s);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : loading ? (
                <p className="px-3 py-4 text-sm text-zinc-500">Searching…</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-4 text-sm text-zinc-500">
                  No courses found for “{q.trim()}”.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      href={r.type === "course" ? `/courses/${r.slug}` : `/digital-products/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-zinc-50"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
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
                          {r.description || (r.type === "product" ? "Digital Product" : r.level)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand-600">
                        {formatPrice(r.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {q.trim().length >= 2 && !loading && results.length > 0 && (
              <div className="safe-bottom shrink-0 border-t border-zinc-100 p-4">
                <button
                  onClick={goToAll}
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}