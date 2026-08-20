"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type CourseItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  subtitle: string;
  category: string;
  language: string;
  price: number;
  original_price: number;
  level: string;
  is_featured: boolean;
  certificate: boolean;
  tags: string[];
  cover_image: string | null;
  created_at: string;
  hasLive: boolean;
  lessonCount: number;
  totalMinutes: number;
  instructor: string;
  ratingAvg: number;
  reviewCount: number;
  enrollmentCount: number;
};

const CATEGORIES = [
  {
    key: "AI & Productivity",
    keyword: /ai|product|automation|automate/i,
    desc: "AI tools এবং automation",
    icon: "fa-solid fa-microchip",
  },
  {
    key: "Freelancing",
    keyword: /freelanc|upwork|fiverr|marketplace|client/i,
    desc: "Marketplace এবং client work",
    icon: "fa-solid fa-laptop-code",
  },
  {
    key: "Graphic Design",
    keyword: /design|graphic|canva|creative/i,
    desc: "Design এবং creative skills",
    icon: "fa-solid fa-palette",
  },
  {
    key: "Digital Marketing",
    keyword: /market|advertis|seo|social/i,
    desc: "Marketing এবং advertising",
    icon: "fa-solid fa-bullhorn",
  },
  {
    key: "Passive Income",
    keyword: /passive|income|monetiz/i,
    desc: "Online income strategies",
    icon: "fa-solid fa-sack-dollar",
  },
  {
    key: "Web & Tech",
    keyword: /web|tech|develop|program|code/i,
    desc: "Web এবং technology",
    icon: "fa-solid fa-code",
  },
  {
    key: "Content Creation",
    keyword: /content|youtube|blog/i,
    desc: "Content এবং creation",
    icon: "fa-solid fa-wand-magic-sparkles",
  },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const PRICE_RANGES = [
  { key: "free", label: "Free", test: (p: number) => p === 0 },
  { key: "under500", label: "Under ৳500", test: (p: number) => p > 0 && p < 500 },
  { key: "500to1000", label: "৳500 – ৳1,000", test: (p: number) => p >= 500 && p <= 1000 },
  { key: "over1000", label: "৳1,000+", test: (p: number) => p > 1000 },
];

const RATING_OPTS = [4.5, 4.0, 3.5];

const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "popular", label: "Most Popular" },
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Highest Rated" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "কোর্সে কিভাবে ভর্তি হবো?",
    a: "আপনার পছন্দের কোর্সের 'এখনই ভর্তি করুন' বাটনে ক্লিক করুন, checkout পেজে payment সম্পন্ন করলেই সাথে সাথে আপনার dashboard-এ কোর্সটি দেখা যাবে।",
  },
  {
    q: "কোর্স কি lifetime access?",
    a: "হ্যাঁ, একবার ভর্তি হলে কোর্সটির সকল ভিডিও, resources এবং recordings пожизненно access পাবেন — কোনো সময়সীমা নেই।",
  },
  {
    q: "মোবাইল দিয়ে কি কোর্স করা যাবে?",
    a: "অবশ্যই। যেকোনো smartphone, tablet বা computer থেকে কোর্সের সব ভিডিও দেখা ও practice করা যাবে।",
  },
  {
    q: "লাইভ ক্লাসের recording পাওয়া যাবে?",
    a: "হ্যাঁ, প্রতিটি live class-এর recording dashboard-এ রেখে দেওয়া হয়, তাই কোনো ক্লাস miss করলেও পরে দেখে নিতে পারবেন।",
  },
  {
    q: "কোর্স শেষ করলে certificate পাবো?",
    a: "কোর্সের সব lesson সম্পন্ন করলে প্ল্যাটফর্ম থেকে একটি certificate দেওয়া হয় যা portfolio বা LinkedIn-এ যুক্ত করতে পারবেন।",
  },
  {
    q: "Payment করার পর course access কিভাবে পাবো?",
    a: "Payment সম্পন্ন হওয়ার সাথে সাথেই course access চালু হয়ে যায়। bKash/Nagad-এর ক্ষেত্রে payment verify হয়ে গেলেই access পাবেন।",
  },
  {
    q: "Refund policy কী?",
    a: "আমাদের refund policy পেজে বিস্তারিত জানতে পারবেন। সাধারণত নির্দিষ্ট সময়ের মধ্যে এবং শর্ত সাপেক্ষে refund request করা যায়।",
  },
  {
    q: "Beginner হলে কোন course দিয়ে শুরু করবো?",
    a: "শুরুর জন্য AI & Productivity এবং Freelancing ক্যাটাগরির beginner-level কোর্সগুলো সবচেয়ে ভালো। কোর্স পেজে level দেখে বেছে নিতে পারবেন।",
  },
];

const TESTIMONIALS = [
  {
    name: "Rafiq Hasan",
    role: "Freelancer",
    quote: "কোর্সের practical approach-এর কারণে আমি নিজের portfolio তৈরি করতে পেরেছি।",
    color: "bg-blue-500",
    initials: "RH",
  },
  {
    name: "Nusrat Jahan",
    role: "Graphic Designer",
    quote: "Canva এবং AI tools শেখার পর সরাসরি client work পাচ্ছি। Plickify-এর support সত্যিই দারুণ।",
    color: "bg-violet-500",
    initials: "NJ",
  },
  {
    name: "Mahadi Hasan",
    role: "Digital Marketer",
    quote: "Digital marketing কোর্স আমার career বদলে দিয়েছে। Live class আর Q&A ছিল খুবই helpful।",
    color: "bg-emerald-500",
    initials: "MH",
  },
];

export type CategoryOption = {
  name: string;
  slug: string;
  icon: string;
  desc?: string;
};

function categorize(category: string) {
  const c = (category || "").toLowerCase();
  if (!c) return "General";
  const match = CATEGORIES.find((x) => x.keyword.test(c));
  return match ? match.key : "Other";
}

function matchesCategory(category: string, name: string) {
  const a = (category || "").toLowerCase();
  const b = name.toLowerCase();
  return a.includes(b) || b.includes(a);
}

function discountPercent(price: number, original: number) {
  if (original > price && price > 0) {
    return Math.round((1 - price / original) * 100);
  }
  return 0;
}

const SERVER_NOW = Date.now();

function CardBadge({ item }: { item: CourseItem }) {
  if (item.price === 0)
    return <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow">FREE</span>;
  if (item.is_featured)
    return <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">BEST SELLER</span>;
  const age = SERVER_NOW - new Date(item.created_at).getTime();
  if (age < 30 * 24 * 60 * 60 * 1000)
    return <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow">NEW</span>;
  if (item.enrollmentCount >= 10)
    return <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white shadow">POPULAR</span>;
  return null;
}

function Stars() {
  return (
    <span className="text-amber-400">
      <i className="fa-solid fa-star" />
      <i className="fa-solid fa-star" />
      <i className="fa-solid fa-star" />
      <i className="fa-solid fa-star" />
      <i className="fa-solid fa-star" />
    </span>
  );
}

function CourseCardView({ item }: { item: CourseItem }) {
  const discount = discountPercent(item.price, item.original_price);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-xl">
      <Link href={`/courses/${item.slug}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900">
          {item.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-white/40">
              {item.title.charAt(0)}
            </div>
          )}
          <div className="absolute left-3 top-3">
            <CardBadge item={item} />
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          {categorize(item.category)}
        </p>
        <Link href={`/courses/${item.slug}`}>
          <h3 className="mt-1 line-clamp-1 text-lg font-bold text-zinc-900 group-hover:text-brand-600">
            {item.title}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600">
          {item.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-circle-play text-brand-600" />
            {item.lessonCount}+ Lessons
          </span>
          {item.totalMinutes > 0 && (
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-clock text-brand-600" />
              {Math.round(item.totalMinutes / 60)}+ Hours
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-signal text-brand-600" />
            {item.level ? capitalize(item.level) : "All Levels"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <Stars />
          <span className="text-sm font-semibold text-zinc-800">
            {item.ratingAvg > 0 ? item.ratingAvg.toFixed(1) : "New"}
          </span>
          {item.reviewCount > 0 && (
            <span className="text-xs text-zinc-500">
              ({item.reviewCount} Reviews)
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-extrabold text-brand-600">
            {formatPrice(item.price)}
          </span>
          {item.original_price > item.price && (
            <span className="text-sm text-zinc-400 line-through">
              {formatPrice(item.original_price)}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded bg-red-600/10 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/checkout/${item.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            এখনই ভর্তি করুন
          </Link>
          <Link
            href={`/courses/${item.slug}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            বিস্তারিত দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

export function CoursesBrowser({
  initialCourses,
  initialQuery,
  stats,
  categories,
  faqItems,
}: {
  initialCourses: CourseItem[];
  initialQuery: string;
  stats: { courses: number; students: number; resources: number; rating: number };
  categories?: CategoryOption[];
  faqItems?: { q: string; a: string }[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [price, setPrice] = useState<string | null>(null);
  const [ratingMin, setRatingMin] = useState<number | null>(null);
  const [sort, setSort] = useState("recommended");
  const [visible, setVisible] = useState(9);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dbCats = useMemo(() => categories ?? [], [categories]);
  const CAT_LIST: CategoryOption[] =
    dbCats.length > 0
      ? dbCats
      : CATEGORIES.map((c) => ({
          name: c.key,
          slug: c.key.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          icon: c.icon,
          desc: c.desc,
        }));

  const categoryKey = useCallback(
    (c: CourseItem) => {
      const raw = c.category || "";
      if (dbCats.length > 0) {
        const m = CAT_LIST.find((x) => matchesCategory(raw, x.name));
        return m ? m.name : "Other";
      }
      return categorize(raw);
    },
    [dbCats, CAT_LIST],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = initialCourses.filter((c) => {
      if (q) {
        const haystack = [
          c.title,
          c.category,
          c.description,
          c.instructor,
          c.tags.join(" "),
          c.subtitle,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (cats.length > 0 && !cats.includes(categoryKey(c))) return false;
      if (levels.length > 0 && !levels.includes(capitalize(c.level))) return false;
      if (types.length > 0) {
        const t = c.hasLive ? (c.lessonCount > 0 ? "live+recorded" : "live") : "recorded";
        if (!types.includes(t)) return false;
      }
      if (price) {
        const range = PRICE_RANGES.find((r) => r.key === price);
        if (range && !range.test(c.price)) return false;
      }
      if (ratingMin && c.ratingAvg > 0 && c.ratingAvg < ratingMin) return false;
      return true;
    });

    list = [...list];
    switch (sort) {
      case "popular":
        list.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.ratingAvg - a.ratingAvg);
        break;
      default:
        list.sort(
          (a, b) =>
            Number(b.is_featured) - Number(a.is_featured) ||
            b.ratingAvg - a.ratingAvg,
        );
    }
    return list;
  }, [initialCourses, query, cats, levels, types, price, ratingMin, sort, categoryKey]);

  const featured = useMemo(
    () =>
      initialCourses.find((c) => c.is_featured) ??
      [...initialCourses].sort((a, b) => b.ratingAvg - a.ratingAvg)[0] ??
      null,
    [initialCourses],
  );

  const shown = filtered.slice(0, visible);
  const hasActiveFilters =
    query || cats.length > 0 || levels.length > 0 || types.length > 0 || price || ratingMin !== null;

  function clearAll() {
    setQuery("");
    setCats([]);
    setLevels([]);
    setTypes([]);
    setPrice(null);
    setRatingMin(null);
    setVisible(9);
  }

  function toggle(arr: string[], v: string) {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  const catCounts: Record<string, number> = {};
  for (const c of initialCourses) {
    const k = categoryKey(c);
    catCounts[k] = (catCounts[k] ?? 0) + 1;
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Category
        </p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={cats.length === 0}
              onChange={() => setCats([])}
              className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
            />
            All Courses
          </label>
          {CAT_LIST.map((c) => (
            <label
              key={c.name}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="checkbox"
                checked={cats.includes(c.name)}
                onChange={() => setCats((prev) => toggle(prev, c.name))}
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              {c.name}
              <span className="ml-auto text-xs text-zinc-400">
                {catCounts[c.name] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Level
        </p>
        <div className="space-y-2">
          {LEVELS.map((l) => (
            <label
              key={l}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="checkbox"
                checked={levels.includes(l)}
                onChange={() => setLevels((prev) => toggle(prev, l))}
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Course Type
        </p>
        <div className="space-y-2">
          {[
            { key: "recorded", label: "Recorded" },
            { key: "live", label: "Live" },
            { key: "live+recorded", label: "Live + Recorded" },
          ].map((t) => (
            <label
              key={t.key}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="checkbox"
                checked={types.includes(t.key)}
                onChange={() => setTypes((prev) => toggle(prev, t.key))}
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Price
        </p>
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <label
              key={r.key}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="radio"
                name="price"
                checked={price === r.key}
                onChange={() => setPrice(price === r.key ? null : r.key)}
                className="h-4 w-4 border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          Rating
        </p>
        <div className="space-y-2">
          {RATING_OPTS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="radio"
                name="rating"
                checked={ratingMin === r}
                onChange={() => setRatingMin(ratingMin === r ? null : r)}
                className="h-4 w-4 border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
              {r.toFixed(1)}+
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Clear All
        </button>
      )}
    </div>
  );

  const hasMatch = (list: string[], v: string) => list.includes(v);

  return (
    <main className="flex-1 bg-white">
      {/* Hero + Search */}
      <section className="bg-gradient-to-b from-brand-50/80 to-white px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            Our Courses
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            আপনার ক্যারিয়ারের জন্য সঠিক কোর্সটি বেছে নিন
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
            AI, Freelancing, Graphic Design, Digital Marketing এবং Online
            Income-এর জন্য practical এবং career-focused courses শিখুন।
          </p>
          <div className="relative mx-auto mt-8 max-w-xl">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(9);
              }}
              placeholder="কোর্স খুঁজুন..."
              className="w-full rounded-full border border-zinc-200 bg-white py-4 text-base text-zinc-900 shadow-lg shadow-brand-600/5 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              style={{ paddingLeft: "3.25rem" }}
            />
            <button
              onClick={() => setVisible(9)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: "fa-solid fa-book-open", value: `${stats.courses}+`, label: "Expert Courses" },
            { icon: "fa-solid fa-users", value: `${stats.students}+`, label: "Students" },
            { icon: "fa-solid fa-gem", value: `${stats.resources}+`, label: "Premium Resources" },
            {
              icon: "fa-solid fa-star",
              value: stats.rating > 0 ? `${stats.rating.toFixed(1)}/5` : "4.9/5",
              label: "Average Rating",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-2xl border border-zinc-100 bg-white px-4 py-5 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <i className={s.icon} />
              </span>
              <p className="mt-2.5 text-xl font-extrabold text-zinc-900">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-600 to-brand-900 shadow-xl shadow-brand-700/20">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Link
                href={`/courses/${featured.slug}`}
                className="relative aspect-video w-full md:aspect-auto md:min-h-[320px]"
              >
                {featured.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.cover_image}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-800 text-6xl text-white/40">
                    {featured.title.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  Featured Course
                </span>
                <h2 className="mt-4 text-3xl font-extrabold text-white">
                  {featured.title}
                </h2>
                <p className="mt-3 text-white/85">{featured.description}</p>
                <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    `${featured.lessonCount}+ Video Lessons`,
                    featured.hasLive ? "Live Classes" : "Class Recordings",
                    "Weekly Q&A",
                    "Assignments",
                    "Premium Resources",
                    featured.certificate ? "Certificate" : "No Certificate",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm font-medium text-white/90"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <i className="fa-solid fa-check text-[10px] text-white" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-extrabold text-white">
                    {formatPrice(featured.price)}
                  </span>
                  {featured.original_price > featured.price && (
                    <span className="text-lg text-white/60 line-through">
                      {formatPrice(featured.original_price)}
                    </span>
                  )}
                  <Link
                    href={`/checkout/${featured.id}`}
                    className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
                  >
                    এখনই ভর্তি করুন
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main listing */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden w-1/4 shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-base font-bold text-zinc-900">
                  ফিল্টার করুন
                </p>
                <div className="mt-5">{filterPanel}</div>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    {query ? `"${query}" এর ফলাফল` : "সব কোর্স"}
                  </h2>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {query
                      ? `${filtered.length}টি কোর্স পাওয়া গেছে`
                      : "আপনার জন্য curated practical courses"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 lg:hidden"
                  >
                    <i className="fa-solid fa-sliders" /> Filter
                    {hasActiveFilters && (
                      <span className="h-2 w-2 rounded-full bg-brand-600" />
                    )}
                  </button>
                  <label className="flex items-center gap-2 text-sm text-zinc-600">
                    Sort by:
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none focus:border-brand-500"
                    >
                      {SORTS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {shown.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {shown.map((c) => (
                    <CourseCardView key={c.id} item={c} />
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-14 text-center">
                  <i className="fa-solid fa-magnifying-glass text-3xl text-zinc-300" />
                  <p className="mt-4 font-semibold text-zinc-700">
                    No courses found
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    অন্য keyword দিয়ে search করুন অথবা filter reset করুন।
                  </p>
                  <button
                    onClick={clearAll}
                    className="mt-5 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {visible < filtered.length && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisible((v) => v + 9)}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white px-8 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    Load More Courses
                    <i className="fa-solid fa-arrow-down text-xs" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl lg:hidden">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-base font-bold text-zinc-900">ফিল্টার করুন</p>
              <button
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Show {filtered.length} Courses
            </button>
          </div>
        </>
      )}

      {/* Categories */}
      <section className="bg-zinc-50/70 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Explore
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
              ক্যাটাগরি অনুযায়ী কোর্স দেখুন
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAT_LIST.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setCats((prev) => (hasMatch(prev, c.name) ? prev : [c.name]));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <i className={c.icon} />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900">{c.name}</p>
                  {c.desc && <p className="mt-0.5 text-sm text-zinc-500">{c.desc}</p>}
                  <p className="mt-1.5 text-xs font-semibold text-brand-600">
                    {catCounts[c.name] ?? 0} courses
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why learn */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Why Learn With Us
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
              শুধু কোর্স নয়, বাস্তব skill তৈরি করুন
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: "fa-solid fa-wrench",
                title: "Practical Learning",
                desc: "বাস্তব কাজের মাধ্যমে শেখানো।",
              },
              {
                icon: "fa-solid fa-diagram-project",
                title: "Project Based",
                desc: "Portfolio তৈরি করার জন্য real-world projects।",
              },
              {
                icon: "fa-solid fa-briefcase",
                title: "Career Focused",
                desc: "Freelancing এবং income-এর জন্য practical guidance।",
              },
            ].map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
                  <i className={w.icon} />
                </span>
                <h3 className="mt-4 font-bold text-zinc-900">{w.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-600">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="bg-gradient-to-br from-brand-800 to-brand-900 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
              Learning Journey
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-white">
              আপনার শেখার যাত্রা
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              { n: "01", title: "Enroll", desc: "আপনার পছন্দের course নির্বাচন করুন।" },
              { n: "02", title: "Learn", desc: "ভিডিও, live class এবং resources ব্যবহার করুন।" },
              { n: "03", title: "Practice", desc: "Assignment এবং real project করুন।" },
              { n: "04", title: "Apply", desc: "Skill ব্যবহার করে career/income শুরু করুন।" },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                <div className="flex h-full flex-col items-center rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-extrabold text-brand-700">
                    {s.n}
                  </span>
                  <h3 className="mt-4 font-bold text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-white/80">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white/50 md:block">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
              শিক্ষার্থীরা কী বলছেন?
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <Stars />
                <p className="mt-4 text-sm leading-relaxed text-zinc-700">
                  “{t.quote}”
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${t.color} text-sm font-bold text-white`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50/70 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
              কোর্স সম্পর্কে সাধারণ প্রশ্ন
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {(faqItems && faqItems.length > 0 ? faqItems : FAQS).map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center shadow-2xl shadow-brand-700/30 sm:p-14">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-200">
            Start Learning Today
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            আপনার নতুন skill journey আজই শুরু করুন
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            আপনার লক্ষ্য অনুযায়ী সঠিক course বেছে নিয়ে আজ থেকেই শেখা শুরু
            করুন।
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
            >
              সব কোর্স দেখুন
              <i className="fa-solid fa-arrow-right text-sm" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-9 py-4 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
