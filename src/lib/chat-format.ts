/** Client-safe minimal chat formatting: escape HTML, then [text](url) links, **bold**, newlines. */

export function escapeHtmlChat(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderChatMessage(content: string) {
  const escaped = escapeHtmlChat(content);
  return escaped
    .replace(
      /\[([^\]]{1,80})\]\((\/[^)\s]{1,300}|https?:\/\/[^)\s]{1,300})\)/g,
      (_m, text: string, url: string) =>
        `<a href="${url}" class="font-semibold underline decoration-2 underline-offset-2 hover:opacity-80" ${url.startsWith("/") ? "" : 'target="_blank" rel="noopener noreferrer"'}>${text}</a>`,
    )
    .replace(/\*\*([^*\n]{1,200})\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}
