import { markdownHeadings, markdownToHtml, markdownToText } from "@/lib/markdown";
import type { MarkdownHeading } from "@/lib/markdown";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "mark",
  "span",
  "small",
  "sub",
  "sup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "hr",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "details",
  "summary",
  "div",
  "section",
  "input",
  "iframe",
]);

const VOID_TAGS = new Set(["br", "hr", "img", "input"]);

const ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  iframe: new Set(["src", "title", "loading", "allow", "allowfullscreen", "class"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
  ol: new Set(["class", "start"]),
  ul: new Set(["class"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
  div: new Set([
    "class",
    "data-block",
    "data-type",
    "data-id",
    "data-slug",
    "data-title",
    "data-price",
    "data-image",
    "data-url",
    "data-embed",
  ]),
  section: new Set(["class"]),
  span: new Set(["class", "style"]),
  p: new Set(["class", "style"]),
  details: new Set(["class", "open"]),
  summary: new Set(["class"]),
  input: new Set(["type", "checked", "disabled"]),
};

const ALLOWED_CSS = new Set([
  "color",
  "background-color",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "line-height",
  "padding",
  "padding-left",
  "margin",
  "margin-left",
]);

function safeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^(javascript|vbscript|data):/i.test(v)) return null;
  if (/^(https?|mailto|tel):/i.test(v)) return v;
  if (v.startsWith("#") || v.startsWith("/")) return v;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) return v;
  return null;
}

function safeRel(value: string): string {
  const parts = value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => /^(nofollow|noopener|noreferrer|ugc|sponsored)$/.test(p));
  return Array.from(new Set(parts)).join(" ");
}

function sanitizeStyle(style: string): string {
  return style
    .split(";")
    .map((seg) => {
      const idx = seg.indexOf(":");
      if (idx < 0) return "";
      const prop = seg.slice(0, idx).trim().toLowerCase();
      let val = seg.slice(idx + 1).trim();
      if (!ALLOWED_CSS.has(prop)) return "";
      if (/url\s*\(/i.test(val) || /expression/i.test(val)) return "";
      val = val.replace(/[;&<>]/g, "");
      return `${prop}: ${val}`;
    })
    .filter(Boolean)
    .join("; ");
}

function sanitizeAttrs(tag: string, attrs: string): string {
  const allowed = ATTRS[tag] ?? new Set<string>();
  const parts: string[] = [];
  const re = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs))) {
    const name = m[1].toLowerCase();
    let value = m[2] ? m[2].replace(/^["']|["']$/g, "") : "";
    if (name.startsWith("on")) continue;

    if (name === "class") {
      const cls = value
        .split(/\s+/)
        .filter((c) => /^rte-/.test(c) || /^language-/.test(c))
        .join(" ");
      if (cls) parts.push(`class="${cls}"`);
      continue;
    }
    if (name === "style") {
      const s = sanitizeStyle(value);
      if (s) parts.push(`style="${s}"`);
      continue;
    }

    if (tag === "div" && name.startsWith("data-")) {
      parts.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
      continue;
    }

    if (!allowed.has(name)) continue;

    switch (name) {
      case "href":
      case "src": {
        if (tag === "iframe") {
          if (
            /^(https?:)?\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/(embed|watch)\//i.test(value) ||
            /^(https?:)?\/\/(www\.)?(player\.)?vimeo\.com\/video\//i.test(value)
          ) {
            parts.push(`${name}="${value}"`);
          }
        } else {
          const u = safeUrl(value);
          if (u) parts.push(`${name}="${u}"`);
        }
        continue;
      }
      case "target":
        if (value === "_blank") parts.push(`target="_blank"`);
        continue;
      case "rel":
        if (value) parts.push(`rel="${safeRel(value)}"`);
        continue;
      case "width":
      case "height":
        if (/^\d+$/.test(value)) parts.push(`${name}="${value}"`);
        continue;
      case "loading":
        if (value === "lazy" || value === "eager") parts.push(`loading="${value}"`);
        continue;
      case "type":
        if (value === "checkbox") parts.push(`type="checkbox"`);
        continue;
      case "checked":
      case "disabled":
      case "allowfullscreen":
        parts.push(name);
        continue;
      case "colspan":
      case "rowspan":
        if (/^\d+$/.test(value) && Number(value) > 0) parts.push(`${name}="${value}"`);
        continue;
      default:
        parts.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }
  }
  return parts.length ? ` ${parts.join(" ")}` : "";
}

const FORBIDDEN_TAGS =
  "script|style|object|embed|form|button|textarea|select|option|link|meta|base|noscript|svg|math|audio|video|source|canvas|template|frame|frameset|title";

export function sanitizeHtml(input: string): string {
  if (!input) return "";
  let html = input
    .replace(
      new RegExp(
        `<\\s*(\\/?)\\s*(${FORBIDDEN_TAGS})([^>]*)>[\\s\\S]*?(<\\s*\\/\\s*\\2\\s*>|$)`,
        "gi",
      ),
      "",
    )
    .replace(new RegExp(`<\\s*(\\/?)\\s*(${FORBIDDEN_TAGS})([^>]*)>`, "gi"), "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)>|<\/([a-zA-Z][a-zA-Z0-9-]*)>/g,
    (match, open: string | undefined, attrs: string | undefined, close: string | undefined) => {
      if (open) {
        const tag = open.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) return "";
        const cleaned = sanitizeAttrs(tag, attrs ?? "");
        if (VOID_TAGS.has(tag)) return `<${tag}${cleaned}>`;
        return `<${tag}${cleaned}>`;
      }
      if (close) {
        const tag = close.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) return "";
        return `</${tag}>`;
      }
      return match;
    },
  );
  return html;
}

export function toPlainText(html: string): string {
  return sanitizeHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRichText(text: string): boolean {
  return /^\s*</.test(text) || /<(p|h[1-6]|div|ul|ol|table|blockquote|pre|figure|details)[\s>]/i.test(text);
}

export function renderContent(text: string): string {
  if (!text) return "";
  if (isRichText(text)) return sanitizeHtml(text);
  return markdownToHtml(text);
}

export function renderHeadings(text: string): MarkdownHeading[] {
  if (!text) return [];
  if (isRichText(text)) return htmlHeadings(text);
  return markdownHeadings(text);
}

function slugifyHeading(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "section";
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

export function ensureHeadingIds(html: string): string {
  const used = new Set<string>();
  return html.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (m, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugifyHeading(text, used);
    if (/id\s*=/.test(attrs)) return m;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export function htmlHeadings(html: string): MarkdownHeading[] {
  const out: MarkdownHeading[] = [];
  const used = new Set<string>();
  const safe = ensureHeadingIds(html);
  const re = /<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(safe))) {
    const level = Number(m[1]);
    const attrs = m[2] ?? "";
    const inner = m[3] ?? "";
    const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const idMatch = attrs.match(/id\s*=\s*"([^"]+)"/);
    const id = idMatch ? idMatch[1] : slugifyHeading(text, used);
    used.add(id);
    out.push({ id, text, level });
  }
  return out;
}

export function toPlainTextMd(md: string): string {
  if (isRichText(md)) return toPlainText(md);
  return markdownToText(md);
}

export function videoPlaceholderToIframe(html: string): string {
  return html.replace(
    /<div[^>]*class="[^"]*rte-embed-video[^"]*"[^>]*data-type="(youtube|vimeo)"[^>]*data-id="([^"]+)"[^>]*>\s*<\/div>/gi,
    (_m, type: string, id: string) => {
      if (type === "youtube") {
        return `<iframe class="rte-video-frame" src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      }
      return `<iframe class="rte-video-frame" src="https://player.vimeo.com/video/${id}" title="Vimeo video player" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    },
  );
}

export function iframeToVideoPlaceholder(html: string): string {
  return html.replace(
    /<iframe[^>]*class="[^"]*rte-video-frame[^"]*"[^>]*>[\s\S]*?<\/iframe>|<iframe[^>]*class="[^"]*rte-video-frame[^"]*"[^>]*\/?>/gi,
    (m: string) => {
      const src = m.match(/src="([^"]+)"/)?.[1] ?? "";
      const yt = src.match(/(?:youtube\.com|youtube-nocookie\.com)\/embed\/([\w-]+)/);
      if (yt) {
        return `<div class="rte-embed rte-embed-video" data-type="youtube" data-id="${yt[1]}"></div>`;
      }
      const vm = src.match(/(?:player\.)?vimeo\.com\/video\/(\d+)/);
      if (vm) {
        return `<div class="rte-embed rte-embed-video" data-type="vimeo" data-id="${vm[1]}"></div>`;
      }
      return m;
    },
  );
}