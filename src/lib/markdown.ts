function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slugifyHeading(text: string, used: Set<string>): string {
  const base = text
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

function inline(text: string): string {
  const esc = escapeHtml(text);
  return esc
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<a href="$2" title="$3">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  const usedHeadings = new Set<string>();
  let list: { type: string; items: string[] } | null = null;
  let code: string[] | null = null;
  let codeLang = "";

  function closeList() {
    if (list) {
      const tag = list.type === "ul" ? "ul" : "ol";
      html.push(
        `<${tag}>${list.items.map((l) => `<li>${inline(l)}</li>`).join("")}</${tag}>`,
      );
      list = null;
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (code !== null) {
      if (/^\s*```/.test(line)) {
        html.push(
          `<pre><code class="language-${codeLang}">${escapeHtml(code.join("\n"))}</code></pre>`,
        );
        code = null;
        codeLang = "";
      } else {
        code.push(line);
      }
      continue;
    }

    const fence = line.match(/^\s*```([\w-]*)\s*$/);
    if (fence) {
      closeList();
      code = [];
      codeLang = fence[1] ?? "";
      continue;
    }

    const hr = /^\s*---+\s*$/.test(line);
    if (hr) {
      closeList();
      html.push("<hr />");
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const id = slugifyHeading(heading[2], usedHeadings);
      html.push(
        `<h${level} id="${id}">${inline(heading[2])}</h${level}>`,
      );
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      if (!list || list.type !== "ul") {
        closeList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (numbered) {
      if (!list || list.type !== "ol") {
        closeList();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }

  if (code !== null) {
    html.push(
      `<pre><code class="language-${codeLang}">${escapeHtml(code.join("\n"))}</code></pre>`,
    );
  }
  closeList();
  return html.join("\n");
}

export type MarkdownHeading = {
  id: string;
  text: string;
  level: number;
};

export function markdownHeadings(md: string): MarkdownHeading[] {
  const out: MarkdownHeading[] = [];
  const used = new Set<string>();
  for (const raw of md.split("\n")) {
    const m = raw.trimEnd().match(/^(#{2,3})\s+(.*)$/);
    if (!m) continue;
    const level = m[1].length;
    const text = escapeHtml(m[2].trim()).replace(/\*\*([^*]+)\*\*/g, "$1");
    out.push({ id: slugifyHeading(text, used), text, level });
  }
  return out;
}

export function markdownToText(md: string): string {
  return md
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/, "")
        .replace(/^\s*[-*+]\s+/, "")
        .replace(/^\s*\d+[.)]\s+/, "")
        .replace(/^\s*>\s?/, "")
        .replace(/```[\w-]*\s*/g, "")
        .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, "$1")
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/(^|\s)\*([^*\n]+)\*/g, "$1$2")
        .replace(/`([^`]+)`/g, "$1"),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}