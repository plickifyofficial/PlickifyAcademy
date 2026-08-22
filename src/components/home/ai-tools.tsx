import type { ToolsContent } from "@/lib/content-schema";

function ToolIcon({ tool }: { tool: ToolsContent["tools"][number] }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 text-zinc-500 transition-colors hover:text-brand-600">
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm shadow-sm">
        {tool.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.image}
            alt={tool.name}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <i className={tool.icon} />
        )}
      </span>
      <span className="whitespace-nowrap text-sm font-semibold">
        {tool.name}
      </span>
    </div>
  );
}

export function AiTools({ content }: { content: ToolsContent }) {
  const tools = content.tools.filter((tool) => tool.visible !== false);
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/70 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {content.label}
        </p>
        {content.autoScroll ? (
          <div
            className="mt-7 overflow-hidden"
            data-aos="fade-up"
            style={{ maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)" }}
          >
            <div className="marquee-track gap-10 pr-10">
              {[...tools, ...tools].map((tool, i) => (
                <ToolIcon key={`${tool.name}-${i}`} tool={tool} />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="mt-7 flex items-center gap-10 overflow-x-auto pb-2 sm:justify-between"
            style={{ scrollbarWidth: "none" }}
            data-aos="fade-up"
          >
            {tools.map((tool) => (
              <ToolIcon key={tool.name} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

