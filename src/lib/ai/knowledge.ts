import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteContent } from "@/lib/site-content";
import {
  aboutDefaults,
  contactDefaults,
  ctaDefaults,
  faqPageDefaults,
  privacyPageDefaults,
  refundPageDefaults,
  termsPageDefaults,
} from "@/lib/content-schema";
import { toPlainText } from "@/lib/rte";
import type { AiAssistantSettings } from "@/lib/ai/config";

const KB_STATE_KEY = "internal.ai_kb_state";
const MAX_BODY = 3500;

export type KnowledgeChunkInput = {
  source_type: string;
  source_id: string;
  title: string;
  subtitle?: string;
  body?: string;
  url?: string;
};

export type KnowledgeStats = Record<string, number> & { synced_at?: string };

function clip(text: string, max = MAX_BODY) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

async function readSiteContentRaw(key: string): Promise<Record<string, unknown> | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return (data?.value as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Builders per source                                                 */
/* ------------------------------------------------------------------ */

async function courseChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("courses")
    .select("id, title, slug, subtitle, description, category, level, price, original_price, language, tags")
    .eq("is_published", true)
    .limit(300);
  return (data ?? []).map((c) => {
    const parts = [
      c.subtitle ? `Subtitle: ${clip(c.subtitle, 200)}` : "",
      c.description ? `About this course: ${clip(String(c.description), 1500)}` : "",
      `Price: ${c.price} BDT${c.original_price > c.price ? ` (regular ${c.original_price} BDT)` : ""}`,
      c.category ? `Category: ${c.category}` : "",
      c.level ? `Level: ${c.level}` : "",
      Array.isArray(c.tags) && c.tags.length ? `Topics: ${c.tags.join(", ")}` : "",
      "Enrollment link: /courses/" + c.slug,
    ].filter(Boolean);
    return {
      source_type: "course",
      source_id: c.id,
      title: c.title || "Untitled course",
      subtitle: clip(c.subtitle ?? "", 200),
      body: parts.join("\n"),
      url: `/courses/${c.slug}`,
    };
  });
}

async function lessonChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("lessons")
    .select(
      "id, title, description, content, duration_minutes, is_free, order, courses!inner(id, slug, title, is_published)",
    )
    .order("created_at", { ascending: false })
    .limit(600);

  return (data ?? [])
    .filter(
      (l) =>
        (l.courses as unknown as { is_published?: boolean } | null)?.is_published,
    )
    .map((l) => {
      const course = l.courses as unknown as { id: string; slug: string; title: string };
      const parts = [
        `Course: ${course.title}`,
        l.description ? clip(String(l.description), 800) : "",
        l.content ? clip(toPlainText(String(l.content)), 1800) : "",
        l.is_free ? "This lesson is free preview." : "",
      ].filter(Boolean);
      return {
        source_type: "lesson",
        source_id: l.id,
        title: l.title,
        subtitle: course.title,
        body: parts.join("\n"),
        url: `/courses/${course.slug}/lessons/${l.id}`,
      };
    });
}

async function batchChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("batches")
    .select("*")
    .eq("is_published", true)
    .limit(100);
  return (data ?? []).map((b) => {
    const statusLabels: Record<string, string> = {
      open: "Admission OPEN now",
      upcoming: "Upcoming — admission not open yet",
      ongoing: "Currently running",
      closed: "Closed",
    };
    const startDate = b.start_date
      ? new Date(b.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : null;
    const seatsLeft = Math.max(0, (b.seats_total ?? 0) - (b.seats_filled ?? 0));
    const parts = [
      b.description ? clip(String(b.description), 1000) : "",
      startDate ? `Start date: ${startDate}` : "",
      b.schedule ? `Schedule: ${b.schedule}` : "",
      b.duration ? `Duration: ${b.duration}` : "",
      b.class_count ? `Total classes: ${b.class_count}` : "",
      `Status: ${statusLabels[b.status] ?? b.status}`,
      Number.isFinite(seatsLeft) ? `Seats left: ${seatsLeft}` : "",
      b.price != null ? `Price: ${b.price} BDT${b.old_price > b.price ? ` (regular ${b.old_price} BDT)` : ""}` : "",
      Array.isArray(b.features) && b.features.length ? `Includes: ${b.features.join(", ")}` : "",
      "See all batches at /live-batch",
    ].filter(Boolean);
    return {
      source_type: "batch",
      source_id: b.id,
      title: b.title || "Live batch",
      subtitle: "Live Batch",
      body: parts.join("\n"),
      url: "/live-batch",
    };
  });
}

async function productChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("id, name, slug, description, price, old_price, category, product_type, file_format, file_count, tags")
    .eq("is_published", true)
    .limit(300);
  return (data ?? []).map((p) => {
    const parts = [
      p.description ? clip(String(p.description), 1200) : "",
      p.price != null ? `Price: ${p.price} BDT${p.old_price > p.price ? ` (regular ${p.old_price} BDT)` : ""}` : "",
      p.category ? `Category: ${p.category}` : "",
      p.product_type ? `Type: ${p.product_type}` : "",
      p.file_format ? `Format: ${p.file_format}` : "",
      Array.isArray(p.tags) && p.tags.length ? `Tags: ${p.tags.join(", ")}` : "",
      "Buy/see it at /digital-products/" + p.slug,
    ].filter(Boolean);
    return {
      source_type: "product",
      source_id: p.id,
      title: p.name || "Digital product",
      subtitle: p.category ?? "Digital Product",
      body: parts.join("\n"),
      url: `/digital-products/${p.slug}`,
    };
  });
}

async function blogChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("blog_posts")
    .select("id, title, slug, excerpt, body, author_name, published_at, tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200);
  return (data ?? []).map((p) => {
    const plainBody = p.body ? toPlainText(String(p.body)) : "";
    const parts = [
      p.excerpt ? clip(String(p.excerpt), 400) : "",
      plainBody ? clip(plainBody, 2200) : "",
      p.author_name ? `Author: ${p.author_name}` : "",
      Array.isArray(p.tags) && p.tags.length ? `Tags: ${p.tags.join(", ")}` : "",
    ].filter(Boolean);
    return {
      source_type: "blog",
      source_id: p.id,
      title: p.title || "Blog post",
      subtitle: "Blog article",
      body: parts.join("\n"),
      url: `/blog/${p.slug}`,
    };
  });
}

async function faqChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("faqs")
    .select("id, question, answer, page")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(300);
  return (data ?? []).map((f) => ({
    source_type: "faq",
    source_id: f.id,
    title: f.question,
    subtitle: `FAQ (${f.page})`,
    body: f.answer ? clip(f.answer, 1500) : "",
    url:
      f.page === "homepage"
        ? "/"
        : f.page === "courses"
          ? "/courses"
          : f.page === "products"
            ? "/digital-products"
            : f.page === "about"
              ? "/about"
              : f.page === "contact"
                ? "/contact"
                : "/faq",
  }));
}

type PageSpec = { type: string; key: string; defaults: Record<string, unknown>; url: string; titleKey?: string };

async function cmsPageChunks(sources: AiAssistantSettings["sources"]): Promise<KnowledgeChunkInput[]> {
  const specs: PageSpec[] = [];
  if (sources.pages) {
    specs.push({ type: "page", key: "page.about", defaults: aboutDefaults as unknown as Record<string, unknown>, url: "/about" });
    specs.push({ type: "page", key: "page.contact", defaults: contactDefaults as unknown as Record<string, unknown>, url: "/contact" });
  }
  if (sources.policies) {
    specs.push({ type: "policy", key: "page.terms", defaults: termsPageDefaults as unknown as Record<string, unknown>, url: "/terms" });
    specs.push({ type: "policy", key: "page.privacy", defaults: privacyPageDefaults as unknown as Record<string, unknown>, url: "/privacy" });
    specs.push({ type: "policy", key: "page.refund", defaults: refundPageDefaults as unknown as Record<string, unknown>, url: "/refund" });
    specs.push({ type: "policy", key: "page.faq_page", defaults: faqPageDefaults as unknown as Record<string, unknown>, url: "/faq" });
    void ctaDefaults;
  }

  const chunks: KnowledgeChunkInput[] = [];

  for (const spec of specs) {
    const value = await getSiteContent(spec.key, spec.defaults as never);
    const text = toPlainText(JSON.stringify(value)).replace(/[{}",\[\]]+/g, " ");
    chunks.push({
      source_type: spec.type,
      source_id: spec.key,
      title: spec.key.split(".")[1]?.replace(/^\w/, (m) => m.toUpperCase()) ?? spec.key,
      subtitle: spec.type === "policy" ? "Official policy" : "Site information",
      body: clip(text, 2600),
      url: spec.url,
    });
  }

  if (sources.pages) {
    // Homepage CMS summary (hero/stats/why-us etc.)
    const home = await readSiteContentRaw("home.hero");
    if (home) {
      chunks.push({
        source_type: "page",
        source_id: "home.hero",
        title: "Plickify Academy — What we do",
        subtitle: "Homepage introduction",
        body: clip(toPlainText(JSON.stringify(home)).replace(/[{}",\[\]]+/g, " "), 1500),
        url: "/",
      });
    }
  }

  return chunks;
}

async function customPageChunks(): Promise<KnowledgeChunkInput[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("custom_pages")
    .select("id, slug, title, body")
    .eq("is_published", true)
    .limit(100);
  return (data ?? []).map((p) => ({
    source_type: "custom_page",
    source_id: p.id,
    title: p.title,
    subtitle: "Academy page",
    body: p.body ? clip(toPlainText(String(p.body)), 2400) : "",
    url: `/p/${p.slug}`,
  }));
}

/* ------------------------------------------------------------------ */
/* Sync + freshness                                                    */
/* ------------------------------------------------------------------ */

export async function syncKnowledgeBase(
  sources: AiAssistantSettings["sources"],
): Promise<{ counts: Record<string, number>; syncedAt: string }> {
  const admin = createAdminClient();

  const groups: Array<[string, boolean, () => Promise<KnowledgeChunkInput[]>]> = [
    ["courses", sources.courses, courseChunks],
    ["lessons", sources.lessons, lessonChunks],
    ["batches", sources.batches, batchChunks],
    ["products", sources.products, productChunks],
    ["blog", sources.blog, blogChunks],
    ["faq", sources.faq, faqChunks],
    ["pages", sources.pages || sources.policies, () => cmsPageChunks(sources)],
    ["custom_pages", sources.pages, customPageChunks],
  ];

  const keptBySource = new Map<string, Set<string>>();
  const counts: Record<string, number> = {};

  for (const [name, enabled, build] of groups) {
    if (!enabled) continue;
    let items: KnowledgeChunkInput[] = [];
    try {
      items = await build();
    } catch {
      items = [];
    }
    counts[name] = items.length;
    keptBySource.set(name, new Set(items.map((i) => i.source_id)));

    const rows = items.map((i) => ({
      source_type: name,
      source_id: i.source_id,
      title: i.title ?? "",
      subtitle: i.subtitle ?? "",
      body: i.body ?? "",
      url: i.url ?? "",
      updated_at: new Date().toISOString(),
    }));

    for (let i = 0; i < rows.length; i += 200) {
      await admin.from("ai_knowledge_chunks").upsert(rows.slice(i, i + 200), {
        onConflict: "source_type,source_id",
      });
    }
  }

  // Delete chunks whose source was disabled or item removed/unpublished.
  const { data: existing } = await admin
    .from("ai_knowledge_chunks")
    .select("id, source_type, source_id");
  const staleIds: string[] = [];
  for (const row of existing ?? []) {
    const kept = keptBySource.get(row.source_type);
    if (!kept || !kept.has(row.source_id)) staleIds.push(row.id);
  }
  for (let i = 0; i < staleIds.length; i += 200) {
    await admin.from("ai_knowledge_chunks").delete().in("id", staleIds.slice(i, i + 200));
  }

  const syncedAt = new Date().toISOString();
  await admin.from("site_content").upsert({
    key: KB_STATE_KEY,
    value: { synced_at: syncedAt, counts },
    updated_at: syncedAt,
  });

  return { counts, syncedAt };
}

/** Rebuild only when underlying content changed since last sync. */
export async function ensureKnowledgeFresh(
  sources: AiAssistantSettings["sources"],
): Promise<void> {
  try {
    const state = await readSiteContentRaw(KB_STATE_KEY);
    const syncedAt = state?.synced_at as string | undefined;

    const admin = createAdminClient();
    const tables = [
      { table: "courses", col: "updated_at", publishedOnly: true },
      { table: "products", col: "updated_at", publishedOnly: true },
      { table: "blog_posts", col: "updated_at", publishedOnly: true },
      { table: "faqs", col: "updated_at", publishedOnly: true },
      { table: "lessons", col: "created_at", publishedOnly: false },
      { table: "site_content", col: "updated_at", publishedOnly: false },
    ] as const;

    let latest = "";
    for (const t of tables) {
      let q = admin
        .from(t.table)
        .select(t.col)
        .order(t.col, { ascending: false })
        .limit(1);
      if (t.publishedOnly) q = q.eq("is_published", true);
      const { data } = await q;
      const v = ((data?.[0] as Record<string, string> | undefined)?.[t.col]) ?? "";
      if (v > latest) latest = v;
    }
    // batches + custom_pages have their own columns
    for (const [table, col] of [
      ["batches", "updated_at"],
      ["custom_pages", "updated_at"],
    ] as const) {
      const { data } = await admin
        .from(table)
        .select(col)
        .eq("is_published", true)
        .order(col, { ascending: false })
        .limit(1);
      const v = ((data?.[0] as Record<string, string> | undefined)?.[col]) ?? "";
      if (v > latest) latest = v;
    }

    if (!latest) return;
    if (!syncedAt || latest > syncedAt) {
      await syncKnowledgeBase(sources);
    }
  } catch {
    // Never break chatting because of a sync problem.
  }
}

export async function getKnowledgeStats() {
  const admin = createAdminClient();
  const [{ data: bySource }, state] = await Promise.all([
    admin.from("ai_knowledge_chunks").select("source_type"),
    readSiteContentRaw(KB_STATE_KEY),
  ]);
  const counts: Record<string, number> = {};
  for (const row of bySource ?? []) {
    counts[row.source_type] = (counts[row.source_type] ?? 0) + 1;
  }
  return {
    counts,
    total: (bySource ?? []).length,
    syncedAt: (state?.synced_at as string) ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Retrieval                                                           */
/* ------------------------------------------------------------------ */

export type RetrievedChunk = {
  title: string;
  subtitle: string;
  body: string;
  url: string;
  source_type: string;
};

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2)
    .slice(0, 24);
}

/**
 * Keyword-overlap retrieval over knowledge chunks.
 * Works acceptably for Bangla/Banglish/English without external embeddings.
 */
export async function retrieveKnowledge(
  query: string,
  limit = 10,
): Promise<RetrievedChunk[]> {
  const words = tokenize(query);
  if (words.length === 0) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_knowledge_chunks")
    .select("title, subtitle, body, url, source_type")
    .limit(4000);

  if (!data || data.length === 0) return [];

  const scored = data.map((chunk) => {
    const title = (chunk.title || "").toLowerCase();
    const subtitle = (chunk.subtitle || "").toLowerCase();
    const body = (chunk.body || "").toLowerCase();
    let score = 0;
    for (const w of words) {
      if (title.includes(w)) score += 4;
      else if (subtitle.includes(w)) score += 2;
      if (body.includes(w)) score += 1;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score >= 2).slice(0, limit);
  return top.map((s) => s.chunk as RetrievedChunk);
}
