import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/content-modules";
import { markdownToHtml } from "@/lib/markdown";
import { RecordView } from "@/components/blog/record-view";

type Props = {
  params: Promise<{ slug: string }>;
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

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found | Plickify Academy" };

  return {
    title: `${post.title} | Plickify Academy`,
    description: post.excerpt || undefined,
    openGraph: post.cover_image
      ? { images: [{ url: post.cover_image }] }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const bodyHtml = markdownToHtml(post.body ?? "");
  const posts = await getPublishedPosts();
  const related = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="flex-1 bg-zinc-50">
      <RecordView postId={post.id} />

      {post.cover_image && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <i className="fa-solid fa-arrow-left" /> Back to Blog
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          {(post.tags ?? []).map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700"
            >
              {t}
            </span>
          ))}
          <span className="text-zinc-400">{formatDate(post.published_at)}</span>
          <span className="text-zinc-400">
            <i className="fa-solid fa-eye mr-1" />
            {post.view_count ?? 0} views
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-6 flex items-center gap-3 border-b border-zinc-200 pb-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white">
            {(post.author_name || "PA").slice(0, 1)}
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {post.author_name || "Plickify Academy"}
            </p>
            <p className="text-xs text-zinc-500">
              {post.author_role || "Author"} · {post.reading_time || "5 min read"}
            </p>
          </div>
        </div>

        {post.excerpt && (
          <p className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4 text-zinc-700">
            {post.excerpt}
          </p>
        )}

        <article
          className="prose prose-zinc prose-headings:mt-8 prose-headings:font-bold prose-p:text-zinc-700 prose-ul:list-disc prose-li:marker:text-brand-600 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-brand-800 prose-code:before:content-none prose-code:after:content-none mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {related.length > 0 && (
          <div className="mt-14 border-t border-zinc-200 pt-8">
            <h2 className="text-lg font-bold text-zinc-900">Related Articles</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="text-xs text-zinc-400">{formatDate(r.published_at)}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-brand-700">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}