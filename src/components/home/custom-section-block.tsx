import { ProseContent } from "@/components/editor/prose-content";

export type CustomSection = {
  id: string;
  title: string;
  eyebrow: string;
  body: string;
  visible: boolean;
};

export function CustomSectionBlock({ section }: { section: CustomSection }) {
  if (!section.visible) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {section.eyebrow ? (
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {section.eyebrow}
          </p>
        ) : null}
        {section.title ? (
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            {section.title}
          </h2>
        ) : null}
        <div className="mt-8">
          <ProseContent html={section.body} />
        </div>
      </div>
    </section>
  );
}
