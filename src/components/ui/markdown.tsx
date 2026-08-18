import { markdownToHtml } from "@/lib/markdown";

export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  return (
    <div
      className={`md-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(source) }}
    />
  );
}