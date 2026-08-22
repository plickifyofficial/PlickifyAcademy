import Link from "next/link";
import type { FeaturedContent } from "@/lib/content-schema";
import type { Course } from "@/lib/types";

export function FeaturedCourse({
  content,
  course,
}: {
  content: FeaturedContent;
  course?: Course | null;
}) {
  const title = course?.title || content.title;
  const description =
    (course?.subtitle || course?.description || content.description || "")
      .replace(/<[^>]*>/g, "")
      .slice(0, 220);
  const buttonLink = course ? `/courses/${course.slug}` : content.buttonLink;
  const cardImage = content.featuredImage || course?.cover_image;

  return (
    <section className="bg-gradient-to-b from-white via-brand-50/60 to-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl" data-aos="fade-up">
        <div className="grid grid-cols-1 gap-8 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-xl shadow-brand-100/60 sm:p-10 lg:grid-cols-[1.05fr_1.3fr_0.85fr] lg:gap-10">
          <div className="relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 p-6">
            {cardImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cardImage}
                alt={content.featuredImageAlt || course?.title || content.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                <span className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-brand-300/20 blur-2xl" />
                <i className="fa-solid fa-robot absolute right-6 top-6 text-6xl text-white/20" />
              </>
            )}

            <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-extrabold tracking-wide text-amber-950 shadow">
              {content.badge}
            </span>

            {!cardImage && (
              <div>
                <p className="text-lg font-black uppercase leading-none tracking-wide text-white sm:text-2xl">
                  {content.cardTop1}
                </p>
                <p className="text-lg font-black uppercase leading-none tracking-wide text-brand-200 sm:text-2xl">
                  {content.cardTop2}
                </p>
                <p className="mt-2 text-sm font-bold tracking-[0.4em] text-amber-300">
                  {content.cardYear}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              {content.tagline}
            </span>
            <h2 className="mt-3 section-heading font-extrabold text-zinc-900">
              {title}
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              {description}
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {content.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-zinc-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <i className="fa-solid fa-check text-[10px] text-brand-600" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href={buttonLink || "/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
              >
                {content.buttonText}
                <i className="fa-solid fa-arrow-right text-xs" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="space-y-1 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-5">
              {content.info.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-0 last:pb-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <i className={`${row.icon} text-sm`} />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-400">
                      {row.label}
                    </p>
                    <p className="text-sm font-semibold text-zinc-800">
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
