import { sanitizeHtml } from "@/lib/rte";
import { cn } from "@/lib/utils";

export function ProseContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("prose-content", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}