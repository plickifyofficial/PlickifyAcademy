"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogCategory, BlogPost, BlogSettings } from "@/lib/types";
import { BlogCard, BlogFeaturedCard, BlogCardMini } from "@/components/blog/blog-cards";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { logBlogSearch } from "@/lib/actions/blog";
import { categoryOf } from "@/lib/blog-utils";

type Props = {
  posts: BlogPost[];
  categories: BlogCategory[];
  popular: BlogPost[];
  commentCounts: Record<string, number>;
  settings: BlogSettings;
  initialQuery: string;
  initialCategory: string;
  initialSort: string;
};

const SORTS = [
  { key: "latest", label: "Latest" },
  { key: "popular", label: "Popular" },
  { key: "read", label: "Most Read" },
  { key: "commented", label: "Most Commented" },
];

export function BlogBrowser({
  posts,
  categories,
  popular,
  commentCounts,
  settings,
  initialQuery,
  initialCategory,
  initialSort,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(
    SORTS.some((s) => s.key === initialSort) ? initialSort : "latest",
  );
  const [visible, setVisible] = useState(settings.postsPerPage || 9);
  const resultsRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = posts;
    if (category && category !== "All") {
      list = list.filter((p) => {
        const cat = categoryOf(p, categories);
        return cat?.slug === category;
      });
    }
    if (q) {
      list = list.filter((p) => {
        const haystack = [
          p.title,
          p.body ?? "",
          p.excerpt ?? "",
          (p.tags ?? []).join(" "),
          p.author_name ?? "",
          categoryOf(p, categories)?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return list;
  }, [posts, categories, query, category]);

  const filtered = useMemo(() => {
    const list = [...matches];
    switch (sort) {
      case "popular":
        return list.sort(
          (a, b) =>
            Number(b.is_popular) - Number(a.is_popular) ||
            (b.view_count ?? 0) - (a.view_count ?? 0),
        );
      case "read":
        return list.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
      case "commented":
        return list.sort(
          (a, b) => (commentCounts[b.id] ?? 0) - (commentCounts[a.id] ?? 0),
        );
      default:
        return list.sort(
          (a, b) =>
            new Date(b.published_at ?? "").getTime() -
            new Date(a.published_at ?? "").getTime(),
        );
    }
  }, [matches, sort, commentCounts]);

  const featured = posts.find((p) => p.is_featured) ?? posts[0] ?? null;
  const showFeatured =
    settings.showFeatured && featured && !query && (!category || category === "All");

  const rest = showFeatured
    ? filtered.filter((p) => p.id !== featured.id)
    : filtered;

  const shown = rest.slice(0, visible);
  const hasMore = visible < rest.length;

  const activeFilter = !!(query || (category && category !== "All"));

  function syncUrl(next: { q?: string; c?: string; s?: string }) {
    const params = new URLSearchParams();
    const q = next.q !== undefined ? next.q : query;
    const c = next.c !== undefined ? next.c : category;
    const s = next.s !== undefined ? next.s : sort;
    if (q) params.set("search", q);
    if (c && c !== "All") params.set("category", c);
    if (s && s !== "latest") params.set("sort", s);
    const qs = params.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
  }

  function onSearch(term: string, log = false) {
    setQuery(term);
    syncUrl({ q: term });
    if (log && term.trim()) {
      const count = matches.filter((p) =>
        [p.title, p.body ?? "", p.excerpt ?? "", (p.tags ?? []).join(" "), p.author_name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term.trim().toLowerCase()),
      ).length;
      void logBlogSearch(term.trim(), count);
    }
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onCategory(slug: string) {
    setCategory(slug);
    setVisible(settings.postsPerPage || 9);
    syncUrl({ c: slug });
  }

  function onSort(key: string) {
    setSort(key);
    syncUrl({ s: key });
  }

  return (
    <div className="flex-1 bg-zinc-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-900 via-brand-950 to-brand-950 px-4 pb-12 pt-14 text-white sm:px-6 sm:pt-18">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
            <i className="fa-solid fa-book-open-reader" /> Plickify Academy Blog
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            শিখুন, জানুন এবং{" "}
            <span className="bg-gradient-to-r from-brand-300 to-indigo-300 bg-clip-text text-transparent">
              Digital World
            </span>
            -এর সাথে এগিয়ে থাকুন
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            AI, Freelancing, Design, Digital Marketing এবং Online Income নিয়ে
            practical guides, tutorials, tips এবং insights।
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(e.currentTarget.search.value, true);
            }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-xl shadow-black/20"
          >
            <i className="fa-solid fa-magnifying-glass pl-3 text-zinc-400" />
            <input
              name="search"
              defaultValue={query}
              placeholder="কী শিখতে চান? সার্চ করুন..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category chips */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => onCategory("All")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              category === "All"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategory(c.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c.slug
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <div ref={resultsRef} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6">
        {/* Featured */}
        {showFeatured && featured && (
          <div className="mb-12">
            <BlogFeaturedCard post={featured} categories={categories} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900">
                  {activeFilter ? "Search Results" : "সর্বশেষ আর্টিকেল"}
                </h2>
                {activeFilter ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    &ldquo;{query || category}&rdquo; এর জন্য {rest.length}টি ফলাফল পাওয়া গেছে
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-500">
                    নতুন নতুন practical guide এবং valuable insights পড়ুন।
                  </p>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => onSort(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-brand-500"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {rest.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                <i className="fa-solid fa-magnifying-glass-minus text-3xl text-zinc-300" />
                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  কোনো article পাওয়া যায়নি।
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  অন্য keyword দিয়ে চেষ্টা করুন।
                </p>
                <button
                  onClick={() => onSearch("")}
                  className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  সব Article দেখুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {shown.map((post) => (
                  <BlogCard key={post.id} post={post} categories={categories} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisible((v) => v + (settings.postsPerPage || 9))}
                  className="rounded-full border-2 border-brand-600 bg-white px-8 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <i className="fa-solid fa-angles-down mr-2" />
                  Load More Articles
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {settings.showSidebar && (
            <aside className="space-y-6">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Search
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSearch(e.currentTarget.q.value);
                  }}
                  className="mt-3 flex items-center gap-2"
                >
                  <i className="fa-solid fa-magnifying-glass text-zinc-400" />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="Search articles..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                  />
                </form>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Most Popular
                </h3>
                <div className="mt-3 space-y-1">
                  {popular.slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-start gap-3 p-1">
                      <span className="text-lg font-extrabold text-zinc-200">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <BlogCardMini post={p} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Categories
                </h3>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => onCategory("All")}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      category === "All"
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <span>All Articles</span>
                    <span className="text-xs text-zinc-400">{posts.length}</span>
                  </button>
                  {categories.map((c) => {
                    const count = posts.filter((p) => categoryOf(p, categories)?.slug === c.slug).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onCategory(c.slug)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                          category === c.slug
                            ? "bg-brand-50 font-semibold text-brand-700"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-zinc-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <NewsletterCta variant="card" />
            </aside>
          )}
        </div>
      </div>

      {settings.showNewsletter && (
        <div className="pb-12">
          <NewsletterCta />
        </div>
      )}

      {/* Final CTA */}
      <section className="border-t border-zinc-200 bg-white px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl">
          জানার কোনো শেষ নেই — আজই শেখা শুরু করুন
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600">
          Blog পড়ে অনুপ্রাণিত হয়েছেন? আমাদের কোর্স এবং digital products দিয়ে
          শেখাকে কাজে লাগান।
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/courses"
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700"
          >
            Explore Courses
          </Link>
          <Link
            href="/digital-products"
            className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            Digital Products
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}