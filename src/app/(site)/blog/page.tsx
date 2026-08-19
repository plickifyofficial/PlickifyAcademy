import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/content-modules";
import { markdownToText } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Blog | Plickify Academy",
  description:
    "Articles and guides about AI, freelancing, digital skills and online income from Plickify Academy.",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const featured = posts.find((p) => p.is_featured) ?? posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <div className="flex-1 bg-zinc-50">
      <div className="bg-gradient-to-b from-brand-900 to-brand-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
            BLOG
          </p>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Learn. Practice. Grow.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            AI, Freelancing, Digital Skills এবং Online Income-এর উপর আমাদের
            latest articles ও practical guides পড়ুন।
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-12 grid grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-2"
          >
            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-zinc-100">
              {featured.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.cover_image}
                  alt={featured.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <i className="fa-solid fa-newspaper text-5xl text-zinc-300" />
              )}
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(featured.tags ?? []).slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700"
                  >
                    {t}
                  </span>
                ))}
                <span className="text-zinc-400">{formatDate(featured.published_at)}</span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 transition-colors group-hover:text-brand-700">
                {featured.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-zinc-600">
                {featured.excerpt || markdownToText(featured.body ?? "")}
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
                <span>{featured.author_name || "Plickify Academy"}</span>
                <span>·</span>
                <span>{featured.reading_time || "5 min read"}</span>
              </div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 font-semibold text-brand-700">
                Read Article <i className="fa-solid fa-arrow-right" />
              </span>
            </div>
          </Link>
        )}

        {rest.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-zinc-100">
                  {post.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <i className="fa-solid fa-newspaper text-4xl text-zinc-300" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {(post.tags ?? []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-600"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="text-zinc-400">{formatDate(post.published_at)}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-lg font-bold text-zinc-900 transition-colors group-hover:text-brand-700">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-600">
                    {post.excerpt || markdownToText(post.body ?? "")}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{post.author_name || "Plickify Academy"}</span>
                    <span>·</span>
                    <span>{post.reading_time || "5 min read"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !featured && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
              No articles published yet — check back soon.
            </div>
          )
        )}
      </div>
    </div>
  );
}