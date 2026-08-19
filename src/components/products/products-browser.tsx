"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

const HERO_CATEGORIES = [
  "AI Tools",
  "Prompt Packs",
  "Canva Templates",
  "eBooks",
  "Freelancing",
  "Design Resources",
];

const SIDEBAR_CATEGORIES = [
  ...HERO_CATEGORIES,
  "Graphic Design",
  "Marketing",
  "Productivity",
  "Content Creation",
];

const PRODUCT_TYPES = [
  "Template",
  "eBook",
  "Prompt Pack",
  "Toolkit",
  "Course Resource",
  "Design Asset",
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const WHY_FEATURES = [
  {
    icon: "fa-solid fa-bolt",
    title: "Instant Access",
    text: "Payment complete করার পর সঙ্গে সঙ্গে download।",
  },
  {
    icon: "fa-solid fa-briefcase",
    title: "Practical Resources",
    text: "বাস্তব কাজের জন্য তৈরি resources।",
  },
  {
    icon: "fa-solid fa-infinity",
    title: "Lifetime Access",
    text: "একবার কিনলে দীর্ঘমেয়াদি access।",
  },
  {
    icon: "fa-solid fa-gem",
    title: "Premium Quality",
    text: "Professionally designed এবং curated resources।",
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "Choose",
    text: "আপনার প্রয়োজনীয় product নির্বাচন করুন।",
  },
  {
    num: "02",
    title: "Purchase",
    text: "Secure payment complete করুন।",
  },
  {
    num: "03",
    title: "Download",
    text: "Payment-এর পর instant download করুন।",
  },
  {
    num: "04",
    title: "Use",
    text: "আপনার কাজ ও business-এ resource ব্যবহার করুন।",
  },
];

const REVIEWS = [
  {
    name: "Rafiq Hasan",
    role: "Freelancer",
    product: "AI Prompt Pack",
    stars: 5,
    text: "Prompt pack-এর quality অনেক ভালো। আমার content creation-এর কাজ অনেক দ্রুত হচ্ছে।",
    initials: "RH",
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "Nusrat Jahan",
    role: "Social Media Designer",
    product: "Canva Templates",
    stars: 5,
    text: "Templates গুলো খুবই professional। ক্লায়েন্টের কাজে সরাসরি ব্যবহার করছি।",
    initials: "NJ",
    color: "from-violet-600 to-fuchsia-600",
  },
  {
    name: "Tanvir Ahmed",
    role: "YouTube Creator",
    product: "AI Toolkit",
    stars: 5,
    text: "AI tools-এর perfect collection। আমার productivity কয়েকগুণ বেড়ে গেছে।",
    initials: "TA",
    color: "from-emerald-600 to-teal-600",
  },
];

const FAQS = [
  {
    q: "Payment করার পর product কিভাবে পাবো?",
    a: "Payment সফল হওয়ার সঙ্গে সঙ্গে আপনার কাছে product-এর download link পাঠিয়ে দেওয়া হবে এবং আপনি My Digital Products সেকশন থেকে যেকোনো সময় download করতে পারবেন।",
  },
  {
    q: "Product কি instant download করা যাবে?",
    a: "হ্যাঁ। Payment complete হওয়ার পরপরই instant download করার সুবিধা আছে। কোনো অপেক্ষা করতে হবে না।",
  },
  {
    q: "একবার কিনলে lifetime access থাকবে?",
    a: "হ্যাঁ, একবার কিনলে আপনার account-এ product-টি lifetime access-এ থাকবে। ভবিষ্যতে আপডেট আসলেও সেগুলোও পাবেন।",
  },
  {
    q: "কোন file format-এ resource দেওয়া হবে?",
    a: "প্রতিটি product-এর সাথে file format (যেমন PDF, TXT, Canva Link, DOCX) স্পষ্টভাবে লেখা থাকে। Product page ও Quick View-এ format দেখতে পাবেন।",
  },
  {
    q: "Product কি commercial কাজে ব্যবহার করা যাবে?",
    a: "হ্যাঁ, আমাদের products commercial/client কাজে ব্যবহার করা যাবে। তবে product নিজে resell বা redistribution করা যাবে না।",
  },
  {
    q: "Payment method কী কী?",
    a: "bKash, Nagad, Rocket সহ বাংলাদেশের সব জনপ্রিয় mobile banking মাধ্যমে payment নেওয়া হয়।",
  },
  {
    q: "Product download করার সমস্যা হলে কী করবো?",
    a: "Contact page থেকে আমাদের সাথে যোগাযোগ করুন। আমরা ২৪ ঘণ্টার মধ্যে problem সমাধান করে দেব।",
  },
  {
    q: "Refund policy কী?",
    a: "যেহেতু digital product instant download করা যায়, তাই সাধারণত refund দেওয়া হয় না। তবে কোনো technical problem থাকলে আমরা exchange বা সম্পূর্ণ refund দিয়ে থাকি।",
  },
];

function isNew(p: Product) {
  return Date.now() - new Date(p.created_at).getTime() < 30 * 24 * 3600 * 1000;
}

function discountPercent(p: Product) {
  return p.old_price > p.price
    ? Math.round((1 - p.price / p.old_price) * 100)
    : 0;
}

function badgeOf(p: Product): string | null {
  if (p.price <= 0) return "FREE";
  if (p.is_bestseller) return "BEST SELLER";
  if (isNew(p)) return "NEW";
  const d = discountPercent(p);
  if (d >= 30) return `${d}% OFF`;
  return p.tag || null;
}

function categoryOf(p: Product): string {
  const c = (p.category || "").toLowerCase().trim();
  if (c) {
    const exact = SIDEBAR_CATEGORIES.find(
      (x) => x.toLowerCase() === c || x.toLowerCase().includes(c),
    );
    if (exact) return exact;
  }
  const s =
    `${p.name} ${p.description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
  const keywords: [string, string][] = [
    ["prompt", "Prompt Packs"],
    ["canva", "Canva Templates"],
    ["ebook", "eBooks"],
    ["freelanc", "Freelancing"],
    ["proposal", "Freelancing"],
    ["outreach", "Freelancing"],
    ["ai", "AI Tools"],
    ["marketing", "Marketing"],
    ["content", "Content Creation"],
    ["productiv", "Productivity"],
    ["graphic design", "Graphic Design"],
    ["design", "Design Resources"],
    ["social media", "Design Resources"],
    ["templates", "Design Resources"],
  ];
  for (const [k, v] of keywords) if (s.includes(k)) return v;
  return "Other";
}

function CategoryCard({ title, desc, count, icon }: { title: string; desc: string; count: number; icon: string }) {
  return (
    <Link
      href={`/digital-products?category=${encodeURIComponent(title)}`}
      className="group rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg hover:shadow-brand-100"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <i className={icon} />
      </div>
      <h3 className="mt-4 font-bold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{desc}</p>
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
        <span>{count} products</span>
        <i className="fa-solid fa-arrow-right text-xs text-brand-500 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            className={`fa-solid fa-star text-xs ${
              i <= rounded ? "text-amber-400" : "text-zinc-200"
            }`}
          />
        ))}
      </div>
      {value > 0 && (
        <span className="text-xs font-semibold text-zinc-700">
          {value.toFixed(1)}
          {typeof count === "number" ? ` (${count} Reviews)` : ""}
        </span>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-zinc-900">{q}</span>
        <i
          className={`fa-solid fa-chevron-down text-xs text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600">
          {a}
        </p>
      )}
    </div>
  );
}

export function ProductsBrowser({
  products,
  initialQuery,
  initialCategory,
}: {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [chip, setChip] = useState(
    initialCategory && initialCategory !== "All Products"
      ? initialCategory
      : "All Products",
  );
  const [category, setCategory] = useState(
    initialCategory && initialCategory !== "All Products"
      ? initialCategory
      : "All Products",
  );
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(0);
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("recommended");
  const [visible, setVisible] = useState(9);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const chips = useMemo(() => {
    const present = HERO_CATEGORIES.filter((c) =>
      products.some((p) => categoryOf(p) === c),
    );
    return ["All Products", ...present];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const c = categoryOf(p);
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const totalDownloads = useMemo(
    () => products.reduce((s, p) => s + (p.download_count ?? 0), 0),
    [products],
  );
  const avgRating = useMemo(
    () =>
      products.length
        ? products.reduce((s, p) => s + (p.rating_avg ?? 0), 0) / products.length
        : 0,
    [products],
  );

  const featured = useMemo(
    () => products.find((p) => p.is_featured) ?? products[0],
    [products],
  );

  const bestSellers = useMemo(() => {
    const list =
      products.filter((p) => p.is_bestseller).length > 0
        ? products.filter((p) => p.is_bestseller)
        : [...products].sort(
            (a, b) => (b.download_count ?? 0) - (a.download_count ?? 0),
          );
    return list.slice(0, 4);
  }, [products]);

  function matches(p: Product) {
    const q = query.trim().toLowerCase();
    if (q) {
      const hay =
        `${p.name} ${categoryOf(p)} ${p.product_type ?? ""} ${p.description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    const activeCat = chip !== "All Products" ? chip : category;
    if (activeCat !== "All Products" && categoryOf(p) !== activeCat) return false;
    if (type && (p.product_type ?? "") !== type) return false;
    if (price) {
      if (price === "free" && p.price > 0) return false;
      if (price === "under500" && (p.price <= 0 || p.price >= 500)) return false;
      if (price === "500-1000" && (p.price < 500 || p.price > 1000)) return false;
      if (price === "1000+" && p.price <= 1000) return false;
    }
    if (rating > 0 && (p.rating_avg ?? 0) < rating) return false;
    if (availability) {
      if (availability === "instant" && !p.file_url) return false;
      if (availability === "free" && p.price > 0) return false;
      if (availability === "premium" && p.price <= 0) return false;
    }
    return true;
  }

  const filtered = useMemo(() => {
    const list = products.filter(matches);
    switch (sort) {
      case "popular":
        return list.sort(
          (a, b) => (b.download_count ?? 0) - (a.download_count ?? 0),
        );
      case "newest":
        return list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort(
          (a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0),
        );
      default:
        return list.sort((a, b) => {
          const rank = (p: Product) =>
            (p.is_featured ? 4 : 0) + (p.is_bestseller ? 3 : 0) +
            (p.rating_avg ?? 0);
          return rank(b) - rank(a);
        });
    }
  }, [products, query, chip, category, type, price, rating, availability, sort]);

  const shown = filtered.slice(0, visible);

  function selectCat(value: string) {
    setCategory(value);
    if (value !== "All Products") setChip("All Products");
    setVisible(9);
  }

  function selectChip(value: string) {
    setChip(value);
    setCategory(value);
    setVisible(9);
  }

  function clearAll() {
    setQuery("");
    setChip("All Products");
    setCategory("All Products");
    setType("");
    setPrice("");
    setRating(0);
    setAvailability("");
    setVisible(9);
  }

  const hasFilters =
    query || category !== "All Products" || chip !== "All Products" ||
    type || price || rating > 0 || availability;

  function Cover({ p, className }: { p: Product; className?: string }) {
    const gradient = p.gradient || "from-blue-600 to-indigo-600";
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className ?? ""}`}
      >
        {p.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_image} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <i className={`${p.icon || "fa-solid fa-file-lines"} text-5xl text-white/85`} />
        )}
      </div>
    );
  }

  function ProductCard({ p }: { p: Product }) {
    const badge = badgeOf(p);
    return (
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-100">
        <button
          onClick={() => setQuickView(p)}
          className="relative block text-left"
        >
          <Cover p={p} className="aspect-[16/10] w-full" />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white backdrop-blur">
              {badge}
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm text-brand-600 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            <i className="fa-solid fa-eye" />
          </span>
        </button>
        <div className="flex flex-1 flex-col p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            {categoryOf(p)}
          </span>
          <button
            onClick={() => setQuickView(p)}
            className="mt-1 text-left text-lg font-bold text-zinc-900 transition-colors hover:text-brand-600"
          >
            {p.name}
          </button>
          {p.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
              {p.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            {(p.file_count ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <i className="fa-solid fa-layer-group text-brand-400" />
                {p.file_count}+ Resources
              </span>
            )}
            {p.file_url && (
              <span className="inline-flex items-center gap-1">
                <i className="fa-solid fa-download text-brand-400" />
                Instant Download
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <i className="fa-solid fa-infinity text-brand-400" />
              Lifetime Access
            </span>
          </div>
          <div className="mt-3">
            <Stars value={p.rating_avg ?? 0} count={p.review_count ?? 0} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-brand-600">
              {p.price <= 0 ? "Free" : formatPrice(p.price)}
            </span>
            {p.old_price > p.price && (
              <span className="text-sm text-zinc-400 line-through">
                {formatPrice(p.old_price)}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setQuickView(p)}
              className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              এখনই কিনুন
            </button>
            <button
              onClick={() => setQuickView(p)}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              বিস্তারিত
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#f6f9ff]">
      {/* Hero */}
      <section className="px-4 pb-10 pt-16 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-brand-600">
            DIGITAL PRODUCTS
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-5xl">
            আপনার কাজকে আরও সহজ করুন{" "}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              প্রিমিয়াম ডিজিটাল রিসোর্স
            </span>{" "}
            দিয়ে
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-500 sm:text-lg">
            AI Prompt, Canva Templates, eBooks, Design Resources এবং
            Freelancing Tools—আপনার কাজের জন্য প্রয়োজনীয় সব premium digital
            resource এক জায়গায়।
          </p>
          <div className="relative mx-auto mt-8 max-w-xl">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(9);
              }}
              placeholder="ডিজিটাল প্রোডাক্ট খুঁজুন..."
              className="w-full rounded-full border border-zinc-200 bg-white py-4 pl-13 pr-32 text-base text-zinc-900 shadow-lg shadow-brand-600/5 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              style={{ paddingLeft: "3.25rem" }}
            />
            <button
              onClick={() => setVisible(9)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <i className="fa-solid fa-magnifying-glass mr-2" />
              Search
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {chips.map((c) => {
              const active = chip === c;
              return (
                <button
                  key={c}
                  onClick={() => selectChip(c)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                      : "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-6 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: "fa-solid fa-box", value: `${products.length}+`, label: "Premium Resources" },
            {
              icon: "fa-solid fa-download",
              value:
                totalDownloads >= 1000
                  ? `${(totalDownloads / 1000).toFixed(totalDownloads >= 10000 ? 0 : 1)}k+`
                  : `${totalDownloads}+`,
              label: "Downloads",
            },
            {
              icon: "fa-solid fa-star",
              value: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : "4.9/5",
              label: "Average Rating",
            },
            { icon: "fa-solid fa-bolt", value: "100%", label: "Instant Access" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3.5 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <i className={`${s.icon} text-sm`} />
              </div>
              <div>
                <p className="text-lg font-extrabold leading-none text-zinc-900">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-zinc-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Featured Product
            </span>
            <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-brand-600/5 lg:flex">
              <div className="relative lg:w-1/2">
                <Cover p={featured} className="aspect-[4/3] w-full lg:aspect-auto lg:h-full" />
                <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                  {discountPercent(featured) > 0
                    ? `${discountPercent(featured)}% OFF`
                    : "PREMIUM"}
                </span>
              </div>
              <div className="flex flex-col justify-center p-8 lg:w-1/2 lg:p-12">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  {categoryOf(featured)}
                </span>
                <h2 className="mt-2 text-2xl font-extrabold text-zinc-900 sm:text-3xl">
                  {featured.name}
                </h2>
                <p className="mt-3 text-zinc-500">{featured.description}</p>
                <ul className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    `${featured.file_count || 0}+ Resources`,
                    featured.file_format || "Premium Files",
                    featured.file_url ? "Instant Download" : "Lifetime Access",
                    "Lifetime Access",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-zinc-600"
                    >
                      <i className="fa-solid fa-circle-check text-brand-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-brand-600">
                    {featured.price <= 0 ? "Free" : formatPrice(featured.price)}
                  </span>
                  {featured.old_price > featured.price && (
                    <span className="text-lg text-zinc-400 line-through">
                      {formatPrice(featured.old_price)}
                    </span>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setQuickView(featured)}
                    className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    এখনই কিনুন
                  </button>
                  <Link
                    href={`/digital-products/${featured.slug}`}
                    className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    বিস্তারিত দেখুন
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main listing */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              প্রিমিয়াম ডিজিটাল রিসোর্স
            </h2>
            <p className="mt-3 text-zinc-500">
              আপনার কাজ এবং skill development-এর জন্য curated resources।
            </p>
          </div>

          <div className="mt-10 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">ফিল্টার করুন</h3>
                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <FilterGroup title="Category">
                  <div className="space-y-1.5">
                    {SIDEBAR_CATEGORIES.map((c) => {
                      const count = categoryCounts.get(c) ?? 0;
                      if (count === 0) return null;
                      return (
                        <button
                          key={c}
                          onClick={() => selectCat(c)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            category === c && chip === "All Products"
                              ? "bg-brand-50 font-semibold text-brand-700"
                              : "text-zinc-600 hover:bg-zinc-50"
                          }`}
                        >
                          <span>{c}</span>
                          <span className="text-xs text-zinc-400">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </FilterGroup>

                <FilterGroup title="Price">
                  <div className="space-y-1.5">
                    {[
                      { value: "free", label: "Free" },
                      { value: "under500", label: "Under ৳500" },
                      { value: "500-1000", label: "৳500–৳1,000" },
                      { value: "1000+", label: "৳1,000+" },
                    ].map((o) => (
                      <label
                        key={o.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600"
                      >
                        <input
                          type="radio"
                          name="price"
                          checked={price === o.value}
                          onChange={() => setPrice(o.value)}
                          className="h-4 w-4 accent-brand-600"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Product Type">
                  <div className="space-y-1.5">
                    {PRODUCT_TYPES.map((t) => (
                      <label
                        key={t}
                        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600"
                      >
                        <input
                          type="checkbox"
                          checked={type === t}
                          onChange={() =>
                            setType((prev) => (prev === t ? "" : t))
                          }
                          className="h-4 w-4 accent-brand-600"
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Rating">
                  <div className="space-y-1.5">
                    {[4.5, 4.0, 3.5].map((r) => (
                      <label
                        key={r}
                        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={rating === r}
                          onChange={() => setRating(r)}
                          className="h-4 w-4 accent-brand-600"
                        />
                        {r.toFixed(1)}+
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Availability">
                  <div className="space-y-1.5">
                    {[
                      { value: "instant", label: "Instant Download" },
                      { value: "free", label: "Free" },
                      { value: "premium", label: "Premium" },
                    ].map((o) => (
                      <label
                        key={o.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600"
                      >
                        <input
                          type="radio"
                          name="avail"
                          checked={availability === o.value}
                          onChange={() => setAvailability(o.value)}
                          className="h-4 w-4 accent-brand-600"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </FilterGroup>
              </div>
            </aside>

            {/* Grid */}
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    সব ডিজিটাল প্রোডাক্ট
                    {category !== "All Products" && (
                      <span className="text-brand-600"> — {category}</span>
                    )}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    আপনার কাজের জন্য সেরা resources খুঁজে নিন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 lg:hidden"
                  >
                    <i className="fa-solid fa-sliders text-brand-600" />
                    Filter
                  </button>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 outline-none focus:border-brand-500"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {shown.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
                  <i className="fa-solid fa-box-open text-4xl text-zinc-300" />
                  <h3 className="mt-4 text-lg font-bold text-zinc-900">
                    কোনো প্রোডাক্ট পাওয়া যায়নি।
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    অন্য keyword বা filter ব্যবহার করে দেখুন।
                  </p>
                  <button
                    onClick={clearAll}
                    className="mt-5 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {shown.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                  {filtered.length > visible && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => setVisible((v) => v + 9)}
                        className="rounded-full border border-brand-300 bg-white px-8 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        আরও প্রোডাক্ট দেখুন
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              ক্যাটাগরি অনুযায়ী রিসোর্স খুঁজুন
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "AI Tools", desc: "AI productivity resources.", icon: "fa-solid fa-brain" },
              { title: "Prompt Packs", desc: "Ready-to-use AI prompts.", icon: "fa-solid fa-bolt" },
              { title: "Canva Templates", desc: "Editable design templates.", icon: "fa-solid fa-palette" },
              { title: "eBooks", desc: "Practical digital guides.", icon: "fa-solid fa-book" },
              { title: "Freelancing", desc: "Freelancing resources.", icon: "fa-solid fa-briefcase" },
              { title: "Design Resources", desc: "Premium creative assets.", icon: "fa-solid fa-wand-magic-sparkles" },
            ].map((c) => (
              <CategoryCard
                key={c.title}
                title={c.title}
                desc={c.desc}
                icon={c.icon}
                count={categoryCounts.get(c.title) ?? 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Plickify */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Why Plickify
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              কেন আমাদের ডিজিটাল রিসোর্স কিনবেন?
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl text-white shadow-lg shadow-brand-600/30">
                  <i className={f.icon} />
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              কিভাবে কাজ করে?
            </h2>
          </div>
          <div className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-brand-200 lg:block" />
            {HOW_STEPS.map((s) => (
              <div key={s.num} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-lg font-extrabold text-white shadow-lg shadow-brand-600/30">
                  {s.num}
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{s.title}</h3>
                <p className="mx-auto mt-1 max-w-[220px] text-sm text-zinc-500">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  Best Sellers
                </span>
                <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
                  সবচেয়ে জনপ্রিয় রিসোর্স
                </h2>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              আমাদের কাস্টমারদের কথা
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className="fa-solid fa-star text-sm text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-zinc-600">“{r.text}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${r.color} text-sm font-bold text-white`}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{r.name}</p>
                    <p className="text-xs text-zinc-400">
                      {r.role} · {r.product}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              ডিজিটাল প্রোডাক্ট সম্পর্কে সাধারণ প্রশ্ন
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1a3a] to-brand-900 px-6 py-16 text-center sm:px-12">
          <span className="text-xs font-bold tracking-[0.25em] text-brand-300">
            READY TO WORK SMARTER?
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            আপনার কাজকে আরও সহজ করুন আজ থেকেই
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-300">
            Premium digital resources দিয়ে আপনার productivity এবং creativity
            বাড়ান।
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#products"
              onClick={(e) => e.preventDefault()}
              className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              সব প্রোডাক্ট দেখুন
            </a>
            <Link
              href="/signup"
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-2xl lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">ফিল্টার করুন</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100"
              >
                <i className="fa-solid fa-xmark text-zinc-500" />
              </button>
            </div>
            <div className="space-y-2">
              {SIDEBAR_CATEGORIES.map((c) => {
                const count = categoryCounts.get(c) ?? 0;
                if (count === 0) return null;
                return (
                  <button
                    key={c}
                    onClick={() => {
                      selectCat(c);
                      setDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      category === c && chip === "All Products"
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <span>{c}</span>
                    <span className="text-xs text-zinc-400">{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 border-t border-zinc-100 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Price
              </p>
              <div className="mt-2 space-y-1.5">
                {[
                  { value: "free", label: "Free" },
                  { value: "under500", label: "Under ৳500" },
                  { value: "500-1000", label: "৳500–৳1,000" },
                  { value: "1000+", label: "৳1,000+" },
                ].map((o) => (
                  <label
                    key={o.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600"
                  >
                    <input
                      type="radio"
                      name="price-m"
                      checked={price === o.value}
                      onChange={() => setPrice(o.value)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={() => {
                  clearAll();
                  setDrawerOpen(false);
                }}
                className="mt-5 w-full rounded-full border border-brand-300 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700"
              >
                Clear All
              </button>
            )}
          </div>
        </>
      )}

      {/* Quick view modal */}
      {quickView && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setQuickView(null)}
          />
          <div className="fixed inset-x-0 top-4 z-50 mx-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-1rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="relative">
              <Cover p={quickView} className="aspect-[16/7] w-full" />
              <button
                onClick={() => setQuickView(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  {categoryOf(quickView)} · {quickView.product_type ?? "Digital"}
                </span>
                <Stars value={quickView.rating_avg ?? 0} count={quickView.review_count ?? 0} />
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-zinc-900">
                {quickView.name}
              </h2>
              <p className="mt-2 text-zinc-500">{quickView.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    icon: "fa-solid fa-box",
                    label: "Resources",
                    value: `${quickView.file_count || 0}+`,
                  },
                  {
                    icon: "fa-solid fa-file",
                    label: "Format",
                    value: quickView.file_format || "—",
                  },
                  {
                    icon: "fa-solid fa-hard-drive",
                    label: "Size",
                    value: quickView.file_size || "—",
                  },
                  {
                    icon: "fa-solid fa-download",
                    label: "Downloads",
                    value: `${quickView.download_count || 0}+`,
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-center"
                  >
                    <i className={`${m.icon} text-brand-500`} />
                    <p className="mt-1 truncate text-sm font-bold text-zinc-900">
                      {m.value}
                    </p>
                    <p className="text-xs text-zinc-400">{m.label}</p>
                  </div>
                ))}
              </div>

              {(quickView.tags?.length ?? 0) > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {(quickView.tags ?? []).slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-6">
                <div>
                  <span className="text-3xl font-extrabold text-brand-600">
                    {quickView.price <= 0 ? "Free" : formatPrice(quickView.price)}
                  </span>
                  {quickView.old_price > quickView.price && (
                    <span className="ml-2 text-lg text-zinc-400 line-through">
                      {formatPrice(quickView.old_price)}
                    </span>
                  )}
                  {discountPercent(quickView) > 0 && (
                    <span className="ml-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {discountPercent(quickView)}% OFF
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/digital-products/${quickView.slug}`}
                    className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    বিস্তারিত দেখুন
                  </Link>
                  <button className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                    এখনই কিনুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-zinc-100 py-4 first:pt-0 last:border-b-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </p>
      {children}
    </div>
  );
}