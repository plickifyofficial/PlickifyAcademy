import Link from "next/link";
import type { BlogAuthor, BlogCategory, BlogPost, BlogSettings } from "@/lib/types";
import { BlogCard, BlogCardMini } from "@/components/blog/blog-cards";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { categoryOf } from "@/lib/blog-utils";

export function BlogArchive({
  eyebrow,
  title,
  description,
  author,
  posts,
  categories,
  popular,
  settings,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
  author?: BlogAuthor | null;
  posts: BlogPost[];
  categories: BlogCategory[];
  popular: BlogPost[];
  settings: BlogSettings;
}) {
  return (
    <div className="flex-1 bg-zinc-50">
      <section className="bg-gradient-to-b from-brand-900 to-brand-950 px-4 pb-10 pt-14 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-200 transition-colors hover:text-white"
          >
            <i className="fa-solid fa-arrow-left" /> Back to Blog
          </Link>
          {author ? (
            <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-2xl font-extrabold text-white shadow-lg">
                {author.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={author.photo} alt={author.name} className="h-full w-full object-cover" />
                ) : (
                  author.name.slice(0, 1)
                )}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                  {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
                {author?.role && (
                  <p className="mt-1 text-sm font-medium text-brand-200">{author.role}</p>
                )}
                {author?.bio && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
                    {author.bio}
                  </p>
                )}
                {(author?.expertise?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {author!.expertise!.slice(0, 6).map((e) => (
                      <span
                        key={e}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h1>
              {description && (
                <p className="mx-auto mt-4 max-w-2xl text-zinc-300">{description}</p>
              )}
            </>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
                <i className="fa-solid fa-file-circle-xmark text-3xl text-zinc-300" />
                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  কোনো article পাওয়া যায়নি।
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  শীঘ্রই নতুন article যোগ হবে।
                </p>
                <Link
                  href="/blog"
                  className="mt-5 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  সব Article দেখুন
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} categories={categories} />
                ))}
              </div>
            )}
          </div>

          {settings.showSidebar && (
            <aside className="space-y-6">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Most Popular
                </h3>
                <div className="mt-3 space-y-1">
                  {popular.slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-start gap-3 p-1">
                      <span className="text-lg font-extrabold text-zinc-200">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <BlogCardMini post={p} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Categories
                </h3>
                <div className="mt-2 space-y-1">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/blog/category/${c.slug}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-brand-700"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-zinc-400">
                        {posts.filter((p) => categoryOf(p, categories)?.slug === c.slug).length}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <NewsletterCta variant="card" />
            </aside>
          )}
        </div>

        {settings.showNewsletter && (
          <div className="pt-6">
            <NewsletterCta />
          </div>
        )}
      </div>
    </div>
  );
}