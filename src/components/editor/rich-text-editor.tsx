"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  sanitizeHtml,
  videoPlaceholderToIframe,
  iframeToVideoPlaceholder,
} from "@/lib/rte";
import { MediaPicker } from "@/components/editor/media-picker";

type Preset = "full" | "medium" | "basic";
type EmbedOption = { id: string; title: string; slug: string };

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  preset?: Preset;
  placeholder?: string;
  minHeight?: number;
  autosave?: (html: string) => Promise<void>;
  courseOptions?: EmbedOption[];
  productOptions?: EmbedOption[];
};

const HEADING_OPTIONS = [
  { value: "p", label: "Normal", icon: "fa-solid fa-paragraph" },
  { value: "h2", label: "Heading 2", icon: "fa-solid fa-heading" },
  { value: "h3", label: "Heading 3", icon: "fa-solid fa-heading" },
  { value: "h4", label: "Heading 4", icon: "fa-solid fa-heading" },
  { value: "blockquote", label: "Quote", icon: "fa-solid fa-quote-right" },
  { value: "pre", label: "Code block", icon: "fa-solid fa-code" },
];

const SIZE_OPTIONS = [
  { value: "", label: "Size" },
  { value: "0.8125rem", label: "Small" },
  { value: "1rem", label: "Normal" },
  { value: "1.125rem", label: "Large" },
  { value: "1.25rem", label: "X-Large" },
  { value: "1.5rem", label: "XX-Large" },
];

const TEXT_COLORS = [
  "#111827",
  "#374151",
  "#6b7280",
  "#e11d48",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

const HIGHLIGHTS = [
  "#fef3c7",
  "#fee2e2",
  "#dcfce7",
  "#dbeafe",
  "#ede9fe",
  "#ffedd5",
  "#cffafe",
];

const EMOJIS = [
  "😀","😊","😂","🤣","😍","🤔","😎","😢","😭","😡","👍","👎",
  "👏","🙏","🤝","💪","👋","❤️","🔥","⭐","✨","🎉",
  "💡","⚠️","✅","❌","🚀","💬","📢","🔔","📝","💰","📚","🎯",
  "💻","📱","🎓","🏆","🥇","📌","📊","🌐","🕐","🏠",
];

const BLOCKS = [
  { key: "info", label: "Info Box", icon: "fa-solid fa-circle-info" },
  { key: "warning", label: "Warning Box", icon: "fa-solid fa-triangle-exclamation" },
  { key: "success", label: "Success Box", icon: "fa-solid fa-circle-check" },
  { key: "cta", label: "CTA Box", icon: "fa-solid fa-bullhorn" },
];

const INTERNAL_PAGES = [
  { label: "Home", url: "/" },
  { label: "All Courses", url: "/courses" },
  { label: "Digital Products", url: "/digital-products" },
  { label: "Live Batch", url: "/live-batch" },
  { label: "Live Course", url: "/live-course" },
  { label: "Blog", url: "/blog" },
  { label: "FAQ", url: "/faq" },
  { label: "About Us", url: "/about" },
  { label: "Contact", url: "/contact" },
  { label: "Terms & Conditions", url: "/terms" },
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Refund Policy", url: "/refund" },
];

function escapeHtmlAttr(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function parseVideoUrl(url: string): { type: "youtube" | "vimeo"; id: string } | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (yt) return { type: "youtube", id: yt[1] };
  const vm = url.match(/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", id: vm[1] };
  return null;
}

function ToolbarButton({
  icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm text-[#3c434a] transition-colors hover:bg-[#f0f0f1] disabled:opacity-40",
        active && "bg-[#e5f0fb] text-[#2271b1]",
      )}
    >
      <i className={icon} />
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  preset = "full",
  placeholder = "Start writing...",
  minHeight = 240,
  autosave,
  courseOptions = [],
  productOptions = [],
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string>(value);
  const autosaveTimer = useRef<number | null>(null);

  const [menu, setMenu] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [source, setSource] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  const [align, setAlign] = useState("left");
  const [block, setBlock] = useState("p");

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkBlank, setLinkBlank] = useState(false);
  const [linkNofollow, setLinkNofollow] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");

  const [imageOpen, setImageOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageWidth, setImageWidth] = useState("");

  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [tableOpen, setTableOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const payload = videoPlaceholderToIframe(sanitizeHtml(el.innerHTML));
    lastEmitted.current = payload;
    onChange(payload);
    const text = el.textContent ?? "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(text.length);
  }, [onChange]);

  const handleInput = useCallback(() => {
    emit();
    if (autosave) {
      setSaveState("dirty");
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = window.setTimeout(() => {
        setSaveState("saving");
        const payload = lastEmitted.current;
        Promise.resolve(autosave(payload))
          .then(() => {
            setSaveState("saved");
            setLastSaved(new Date().toLocaleTimeString());
          })
          .catch(() => setSaveState("idle"));
      }, 1500);
    }
  }, [emit, autosave]);

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    const next = iframeToVideoPlaceholder(value || "");
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (el) {
      el.innerHTML = iframeToVideoPlaceholder(value || "");
      document.execCommand("styleWithCSS", false, "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    function update() {
      const el = editorRef.current;
      if (!el || document.activeElement !== el) return;
      try {
        setBold(document.queryCommandState("bold"));
        setItalic(document.queryCommandState("italic"));
        setUnderline(document.queryCommandState("underline"));
        setStrike(document.queryCommandState("strikeThrough"));
        const fv = (document.queryCommandValue("formatBlock") || "p").toLowerCase().replace(/[<>]/g, "");
        setBlock(fv || "p");
        if (document.queryCommandState("justifyRight")) setAlign("right");
        else if (document.queryCommandState("justifyCenter")) setAlign("center");
        else setAlign("left");
      } catch {
        // ignore
      }
    }
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  function exec(command: string, value?: string) {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false, value);
    emit();
  }

  function insertHtml(html: string) {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("insertHTML", false, html);
    emit();
  }

  function wrapSelection(node: HTMLElement) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      range.insertNode(node);
      const after = node.nextSibling;
      if (after) {
        const r = document.createRange();
        r.setStartAfter(after);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      return;
    }
    try {
      range.surroundContents(node);
    } catch {
      const frag = range.extractContents();
      node.appendChild(frag);
      range.insertNode(node);
    }
  }

  function applySize(size: string) {
    if (!size) return;
    const span = document.createElement("span");
    span.style.fontSize = size;
    wrapSelection(span);
    emit();
  }

  function applyInlineCode() {
    const code = document.createElement("code");
    code.className = "rte-inline-code";
    wrapSelection(code);
    emit();
  }

  function applyColor(color: string) {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    emit();
  }

  function applyHighlight(color: string) {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("hiliteColor", false, color);
    emit();
  }

  function applyLink() {
    const url = linkUrl.trim();
    if (!url) return;
    const rel = [linkNofollow ? "nofollow" : "", "noopener"].filter(Boolean).join(" ");
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    const collapsed = !sel || sel.rangeCount === 0 || sel.getRangeAt(0).collapsed;
    if (collapsed) {
      insertHtml(
        `<a href="${escapeHtmlAttr(url)}"${linkBlank ? ' target="_blank"' : ""}${rel ? ` rel="${rel}"` : ""}>${escapeHtmlAttr(linkText.trim() || url)}</a>`,
      );
    } else {
      document.execCommand("createLink", false, url);
      const sel2 = window.getSelection();
      if (sel2 && sel2.rangeCount) {
        const start = sel2.getRangeAt(0).startContainer;
        let n: Node | null = start;
        while (n && n !== el) {
          if (n instanceof HTMLAnchorElement) {
            n.setAttribute("target", linkBlank ? "_blank" : "");
            n.setAttribute("rel", rel);
            break;
          }
          n = n.parentNode;
        }
      }
      emit();
    }
    setLinkOpen(false);
    setLinkUrl("");
    setLinkText("");
    setLinkBlank(false);
    setLinkNofollow(false);
  }

  function insertImage() {
    if (!imageUrl.trim()) return;
    const w = imageWidth.trim();
    insertHtml(
      `<figure class="rte-figure"><img src="${escapeHtmlAttr(imageUrl.trim())}" alt="${escapeHtmlAttr(imageAlt.trim())}"${w ? ` width="${w}"` : ""} loading="lazy" /><figcaption>${escapeHtmlAttr(imageAlt.trim())}</figcaption></figure>`,
    );
    setImageOpen(false);
    setImageUrl("");
    setImageAlt("");
    setImageWidth("");
  }

  function insertVideo() {
    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) return;
    insertHtml(
      `<div class="rte-embed rte-embed-video" data-type="${parsed.type}" data-id="${parsed.id}"></div>`,
    );
    setVideoOpen(false);
    setVideoUrl("");
  }

  function insertTable() {
    const rows = Math.min(Math.max(tableRows, 1), 20);
    const cols = Math.min(Math.max(tableCols, 1), 10);
    const head = `<tr>${Array.from({ length: cols }).map(() => "<th>Heading</th>").join("")}</tr>`;
    const body = Array.from({ length: rows })
      .map(
        () =>
          `<tr>${Array.from({ length: cols }).map(() => "<td>Cell</td>").join("")}</tr>`,
      )
      .join("");
    insertHtml(
      `<div class="rte-table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`,
    );
    setTableOpen(false);
  }

  function insertBlock(key: string) {
    const labels: Record<string, { title: string; text: string }> = {
      info: { title: "Info:", text: "Add important information here." },
      warning: { title: "Warning:", text: "Add a warning note here." },
      success: { title: "Success:", text: "Add a success note here." },
      cta: { title: "", text: "Write your call to action message here." },
    };
    const l = labels[key];
    insertHtml(
      `<div class="rte-block rte-block-${key}"><p>${l.title ? `<strong>${l.title}</strong> ` : ""}${l.text}</p></div>`,
    );
    setMenu(null);
  }

  function insertCourse(opt: EmbedOption) {
    insertHtml(
      `<div class="rte-embed-card rte-course-card" data-type="course" data-url="/courses/${opt.slug}" data-title="${escapeHtmlAttr(opt.title)}"><a href="/courses/${opt.slug}"><span class="rte-embed-card-icon"><i class="fa-solid fa-graduation-cap"></i></span><span class="rte-embed-card-text"><strong>${escapeHtmlAttr(opt.title)}</strong><small>View Course</small></span><span class="rte-embed-card-arrow"><i class="fa-solid fa-arrow-right"></i></span></a></div>`,
    );
    setMenu(null);
  }

  function insertProduct(opt: EmbedOption) {
    insertHtml(
      `<div class="rte-embed-card rte-product-card" data-type="product" data-url="/digital-products/${opt.slug}" data-title="${escapeHtmlAttr(opt.title)}"><a href="/digital-products/${opt.slug}"><span class="rte-embed-card-icon"><i class="fa-solid fa-cube"></i></span><span class="rte-embed-card-text"><strong>${escapeHtmlAttr(opt.title)}</strong><small>View Product</small></span><span class="rte-embed-card-arrow"><i class="fa-solid fa-arrow-right"></i></span></a></div>`,
    );
    setMenu(null);
  }

  function insertFaq() {
    insertHtml(
      `<details class="rte-faq"><summary>Frequently asked question</summary><div><p>Write the answer here.</p></div></details>`,
    );
    setMenu(null);
  }

  function insertChecklist() {
    insertHtml(
      `<ul class="rte-checklist"><li><input type="checkbox" disabled=""> Check list item</li></ul>`,
    );
  }

  function toggleFullscreen() {
    setFullscreen((v) => !v);
  }

  function toggleSource() {
    if (!sourceMode) {
      setSource(videoPlaceholderToIframe(sanitizeHtml(editorRef.current?.innerHTML ?? "")));
      setSourceMode(true);
    } else {
      const cleaned = sanitizeHtml(source);
      if (editorRef.current) editorRef.current.innerHTML = iframeToVideoPlaceholder(cleaned);
      lastEmitted.current = cleaned;
      onChange(cleaned);
      setSourceMode(false);
    }
  }

  const filteredInternal = [
    ...INTERNAL_PAGES.filter((p) => !linkSearch || p.label.toLowerCase().includes(linkSearch.toLowerCase())),
    ...courseOptions
      .filter((c) => !linkSearch || c.title.toLowerCase().includes(linkSearch.toLowerCase()))
      .map((c) => ({ label: `Course: ${c.title}`, url: `/courses/${c.slug}` })),
    ...productOptions
      .filter((p) => !linkSearch || p.title.toLowerCase().includes(linkSearch.toLowerCase()))
      .map((p) => ({ label: `Product: ${p.title}`, url: `/digital-products/${p.slug}` })),
  ].slice(0, 12);

  const showMore = preset !== "basic";
  const showRich = preset !== "basic";

  const modalBase =
    "fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#c3c4c7] bg-white",
        fullscreen &&
          "fixed inset-0 z-[60] flex flex-col rounded-none border-0 shadow-2xl",
      )}
    >
      <div
        ref={toolbarRef}
        className={cn(
          "border-b border-[#e2e2e2] bg-[#f6f7f7]",
          fullscreen && "flex-none",
        )}
      >
        <div className="flex items-center gap-0.5 overflow-x-auto px-2 py-1.5">
          <ToolbarButton icon="fa-solid fa-rotate-left" label="Undo" onClick={() => exec("undo")} />
          <ToolbarButton icon="fa-solid fa-rotate-right" label="Redo" onClick={() => exec("redo")} />
          <div className="mx-1 h-6 w-px shrink-0 bg-[#e2e2e2]" />

          {/* Format select */}
          <div className="relative shrink-0">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setMenu(menu === "format" ? null : "format")}
              className="flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-[#3c434a] hover:bg-[#f0f0f1]"
            >
              <i className="fa-solid fa-heading" />
              <span className="hidden sm:inline">
                {HEADING_OPTIONS.find((h) => h.value === block)?.label ?? "Normal"}
              </span>
              <i className="fa-solid fa-chevron-down text-[9px]" />
            </button>
            {menu === "format" && (
              <div className="absolute left-0 top-10 z-30 w-44 rounded-lg border border-[#e2e2e2] bg-white py-1 shadow-lg">
                {HEADING_OPTIONS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      exec("formatBlock", h.value);
                      setMenu(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[#f0f0f1]",
                      block === h.value && "bg-[#e5f0fb] text-[#2271b1]",
                    )}
                  >
                    <i className={`${h.icon} w-4`} />
                    {h.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size select */}
          {showRich && (
            <div className="relative shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setMenu(menu === "size" ? null : "size")}
                className="flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-[#3c434a] hover:bg-[#f0f0f1]"
              >
                <i className="fa-solid fa-text-height" />
                <i className="fa-solid fa-chevron-down text-[9px]" />
              </button>
              {menu === "size" && (
                <div className="absolute left-0 top-10 z-30 w-40 rounded-lg border border-[#e2e2e2] bg-white py-1 shadow-lg">
                  {SIZE_OPTIONS.filter((s) => s.value).map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applySize(s.value);
                        setMenu(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-[#f0f0f1]"
                    >
                      <span style={{ fontSize: s.value }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mx-1 h-6 w-px shrink-0 bg-[#e2e2e2]" />
          <ToolbarButton icon="fa-solid fa-bold" label="Bold" active={bold} onClick={() => exec("bold")} />
          <ToolbarButton icon="fa-solid fa-italic" label="Italic" active={italic} onClick={() => exec("italic")} />
          <ToolbarButton icon="fa-solid fa-underline" label="Underline" active={underline} onClick={() => exec("underline")} />
          <ToolbarButton icon="fa-solid fa-strikethrough" label="Strikethrough" active={strike} onClick={() => exec("strikeThrough")} />

          {showRich && (
            <>
              <div className="relative shrink-0">
                <ToolbarButton
                  icon="fa-solid fa-font"
                  label="Text color"
                  onClick={() => setMenu(menu === "color" ? null : "color")}
                />
                {menu === "color" && (
                  <div className="absolute left-0 top-10 z-30 rounded-lg border border-[#e2e2e2] bg-white p-2 shadow-lg">
                    <div className="grid grid-cols-6 gap-1.5">
                      {TEXT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applyColor(c);
                            setMenu(null);
                          }}
                          className="h-6 w-6 rounded border border-black/10"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative shrink-0">
                <ToolbarButton
                  icon="fa-solid fa-highlighter"
                  label="Highlight"
                  onClick={() => setMenu(menu === "highlight" ? null : "highlight")}
                />
                {menu === "highlight" && (
                  <div className="absolute left-0 top-10 z-30 rounded-lg border border-[#e2e2e2] bg-white p-2 shadow-lg">
                    <div className="grid grid-cols-5 gap-1.5">
                      {HIGHLIGHTS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applyHighlight(c);
                            setMenu(null);
                          }}
                          className="h-6 w-6 rounded border border-black/10"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <ToolbarButton icon="fa-solid fa-link" label="Link" onClick={() => setLinkOpen(true)} />
          <ToolbarButton icon="fa-solid fa-link-slash" label="Unlink" onClick={() => exec("unlink")} />

          {showRich && (
            <>
              <ToolbarButton icon="fa-solid fa-image" label="Insert image" onClick={() => setImageOpen(true)} />
              <ToolbarButton icon="fa-solid fa-video" label="Embed video" onClick={() => setVideoOpen(true)} />
              <div className="relative shrink-0">
                <ToolbarButton
                  icon="fa-solid fa-face-smile"
                  label="Emoji"
                  onClick={() => setMenu(menu === "emoji" ? null : "emoji")}
                />
                {menu === "emoji" && (
                  <div className="absolute left-0 top-10 z-30 grid w-64 grid-cols-8 gap-1 rounded-lg border border-[#e2e2e2] bg-white p-2 shadow-lg">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => {
                          exec("insertText", e);
                          setMenu(null);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#f0f0f1]"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mx-1 h-6 w-px shrink-0 bg-[#e2e2e2]" />

          {showMore && (
            <div className="relative shrink-0">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setMenu(menu === "more" ? null : "more")}
                className="flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-[#3c434a] hover:bg-[#f0f0f1]"
              >
                <i className="fa-solid fa-bars" />
                <span className="hidden sm:inline">More</span>
                <i className="fa-solid fa-chevron-down text-[9px]" />
              </button>
              {menu === "more" && (
                <div className="absolute right-0 top-10 z-40 max-h-[70vh] w-52 overflow-y-auto rounded-lg border border-[#e2e2e2] bg-white py-1 shadow-lg">
                  <MoreItem icon="fa-solid fa-list" label="Bullet list" onClick={() => { exec("insertUnorderedList"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-list-ol" label="Numbered list" onClick={() => { exec("insertOrderedList"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-list-check" label="Checklist" onClick={() => { insertChecklist(); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-align-left" label="Align left" onClick={() => { exec("justifyLeft"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-align-center" label="Align center" onClick={() => { exec("justifyCenter"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-align-right" label="Align right" onClick={() => { exec("justifyRight"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-align-justify" label="Justify" onClick={() => { exec("justifyFull"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-indent" label="Indent" onClick={() => { exec("indent"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-outdent" label="Outdent" onClick={() => { exec("outdent"); setMenu(null); }} />
                  <div className="my-1 border-t border-[#e2e2e2]" />
                  <MoreItem icon="fa-solid fa-quote-right" label="Quote" onClick={() => { exec("formatBlock", "blockquote"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-code" label="Code block" onClick={() => { exec("formatBlock", "pre"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-terminal" label="Inline code" onClick={() => { applyInlineCode(); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-table" label="Insert table" onClick={() => { setTableOpen(true); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-minus" label="Horizontal rule" onClick={() => { exec("insertHorizontalRule"); setMenu(null); }} />
                  <MoreItem icon="fa-solid fa-eraser" label="Clear formatting" onClick={() => { exec("removeFormat"); setMenu(null); }} />
                  <div className="my-1 border-t border-[#e2e2e2]" />
                  {BLOCKS.map((b) => (
                    <MoreItem
                      key={b.key}
                      icon={b.icon}
                      label={b.label}
                      onClick={() => insertBlock(b.key)}
                    />
                  ))}
                  <div className="my-1 border-t border-[#e2e2e2]" />
                  <MoreItem icon="fa-solid fa-graduation-cap" label="Embed course" onClick={() => setMenu("embed-course")} />
                  <MoreItem icon="fa-solid fa-cube" label="Embed product" onClick={() => setMenu("embed-product")} />
                  <MoreItem icon="fa-solid fa-circle-question" label="FAQ block" onClick={() => insertFaq()} />
                </div>
              )}

              {menu === "embed-course" && (
                <div className="absolute right-0 top-10 z-40 max-h-[60vh] w-64 overflow-y-auto rounded-lg border border-[#e2e2e2] bg-white py-1 shadow-lg">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#646970]">
                    Embed a Course
                  </div>
                  {courseOptions.length === 0 && (
                    <div className="px-3 py-2 text-xs text-[#646970]">No courses available.</div>
                  )}
                  {courseOptions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertCourse(c)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[#f0f0f1]"
                    >
                      <i className="fa-solid fa-graduation-cap text-[#2271b1]" />
                      <span className="truncate">{c.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {menu === "embed-product" && (
                <div className="absolute right-0 top-10 z-40 max-h-[60vh] w-64 overflow-y-auto rounded-lg border border-[#e2e2e2] bg-white py-1 shadow-lg">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#646970]">
                    Embed a Product
                  </div>
                  {productOptions.length === 0 && (
                    <div className="px-3 py-2 text-xs text-[#646970]">No products available.</div>
                  )}
                  {productOptions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertProduct(p)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[#f0f0f1]"
                    >
                      <i className="fa-solid fa-cube text-[#2271b1]" />
                      <span className="truncate">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={cn("relative", fullscreen && "flex-1 overflow-auto")}>
        {sourceMode ? (
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            className="block w-full resize-none rounded-none border-0 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 focus:outline-none"
            style={{ minHeight }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            data-placeholder={placeholder}
            className="rte-editable prose-content max-w-none overflow-y-auto px-4 py-4 focus:outline-none"
            style={{ minHeight }}
          />
        )}

        <div
          className={cn(
            "flex items-center justify-between gap-3 border-t border-[#e2e2e2] bg-[#f6f7f7] px-3 py-1.5 text-[11px] text-[#646970]",
            fullscreen && "flex-none",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap">{wordCount} words · {charCount} chars</span>
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-green-600">
                <i className="fa-solid fa-circle-check" />
                Saved{lastSaved ? ` at ${lastSaved}` : ""}
              </span>
            )}
            {saveState === "saving" && (
              <span className="flex items-center gap-1 text-[#2271b1]">
                <i className="fa-solid fa-spinner fa-spin" /> Saving...
              </span>
            )}
            {saveState === "dirty" && (
              <span className="flex items-center gap-1 text-amber-600">
                <i className="fa-solid fa-circle" /> Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleSource}
              className={cn(
                "flex h-7 items-center gap-1 rounded px-2 text-[11px] font-semibold hover:bg-[#e2e2e2]",
                sourceMode && "bg-[#e5f0fb] text-[#2271b1]",
              )}
            >
              <i className="fa-solid fa-code" /> {sourceMode ? "Visual" : "HTML"}
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleFullscreen}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#e2e2e2]"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <i className={fullscreen ? "fa-solid fa-compress" : "fa-solid fa-expand"} />
            </button>
          </div>
        </div>
      </div>

      {/* Link modal */}
      {linkOpen && (
        <div className={modalBase} onClick={() => setLinkOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-base font-bold text-[#1d2327]">
              <i className="fa-solid fa-link mr-2 text-[#2271b1]" /> Insert Link
            </h3>
            <div className="space-y-3">
              <div>
                <label className="wp-label">Link to</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="wp-input"
                  autoFocus
                />
              </div>
              <div>
                <label className="wp-label">Link text (if no text selected)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="wp-input"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                  <input
                    type="checkbox"
                    checked={linkBlank}
                    onChange={(e) => setLinkBlank(e.target.checked)}
                    className="wp-checkbox"
                  />
                  Open in new tab
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3c434a]">
                  <input
                    type="checkbox"
                    checked={linkNofollow}
                    onChange={(e) => setLinkNofollow(e.target.checked)}
                    className="wp-checkbox"
                  />
                  No follow
                </label>
              </div>
              <div>
                <label className="wp-label">Internal pages &amp; courses</label>
                <input
                  type="text"
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="Search..."
                  className="wp-input"
                />
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-[#e2e2e2]">
                  {filteredInternal.map((p) => (
                    <button
                      key={p.url + p.label}
                      type="button"
                      onClick={() => setLinkUrl(p.url)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#3c434a] hover:bg-[#f0f0f1]"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square text-[#2271b1]" />
                      <span className="truncate">{p.label}</span>
                      <span className="ml-auto truncate text-[10px] text-[#8c8f94]">{p.url}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="wp-btn" onClick={() => setLinkOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="wp-btn wp-btn-primary" onClick={applyLink}>
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image modal */}
      {imageOpen && (
        <div className={modalBase} onClick={() => setImageOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-base font-bold text-[#1d2327]">
              <i className="fa-solid fa-image mr-2 text-[#2271b1]" /> Insert Image
            </h3>
            <div className="space-y-3">
              <div>
                <label className="wp-label">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or pick from library"
                    className="wp-input flex-1"
                  />
                  <button
                    type="button"
                    className="wp-btn shrink-0"
                    onClick={() => setMediaOpen(true)}
                  >
                    <i className="fa-solid fa-folder-open mr-1" /> Library
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="wp-label">Alt text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="wp-input"
                  />
                </div>
                <div>
                  <label className="wp-label">Width (px, optional)</label>
                  <input
                    type="number"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    placeholder="800"
                    className="wp-input"
                  />
                </div>
              </div>
              {imageUrl && (
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-[#e2e2e2] bg-[#f0f0f1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="wp-btn" onClick={() => setImageOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="wp-btn wp-btn-primary" onClick={insertImage}>
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video modal */}
      {videoOpen && (
        <div className={modalBase} onClick={() => setVideoOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-base font-bold text-[#1d2327]">
              <i className="fa-solid fa-video mr-2 text-[#2271b1]" /> Embed Video
            </h3>
            <div>
              <label className="wp-label">YouTube or Vimeo URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="wp-input"
                autoFocus
              />
              <p className="mt-1 text-xs text-[#646970]">
                Paste any YouTube or Vimeo link — it will embed responsively.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" className="wp-btn" onClick={() => setVideoOpen(false)}>
                Cancel
              </button>
              <button type="button" className="wp-btn wp-btn-primary" onClick={insertVideo}>
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table modal */}
      {tableOpen && (
        <div className={modalBase} onClick={() => setTableOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-base font-bold text-[#1d2327]">
              <i className="fa-solid fa-table mr-2 text-[#2271b1]" /> Insert Table
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="wp-label">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value) || 1)}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value) || 1)}
                  className="wp-input"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="wp-btn" onClick={() => setTableOpen(false)}>
                Cancel
              </button>
              <button type="button" className="wp-btn wp-btn-primary" onClick={insertTable}>
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaPicker
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          setImageUrl(url);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}

function MoreItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[#3c434a] hover:bg-[#f0f0f1]"
    >
      <i className={`${icon} w-4 text-[#2271b1]`} />
      {label}
    </button>
  );
}
