function inline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let list: string[] | null = null;

  function closeList() {
    if (list) {
      html.push(
        `<ul>${list.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`,
      );
      list = null;
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      if (!list) list = [];
      list.push(bullet[1]);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      continue;
    }

    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

export function markdownToText(md: string): string {
  return md
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/, "")
        .replace(/^\s*[-*+]\s+/, "")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/(^|\s)\*([^*\n]+)\*/g, "$1$2")
        .replace(/`([^`]+)`/g, "$1"),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}