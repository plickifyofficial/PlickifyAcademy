import { aiTools } from "@/lib/site-config";

export function AiTools() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/70 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
          We work with the tools you use
        </p>
        <div
          className="mt-7 flex items-center gap-10 overflow-x-auto pb-2 sm:justify-between"
          style={{ scrollbarWidth: "none" }}
          data-aos="fade-up"
        >
          {aiTools.map((tool) => (
            <div
              key={tool.name}
              className="flex shrink-0 items-center gap-2.5 text-zinc-500 transition-colors hover:text-brand-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm shadow-sm">
                <i className={tool.icon} />
              </span>
              <span className="whitespace-nowrap text-sm font-semibold">
                {tool.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}