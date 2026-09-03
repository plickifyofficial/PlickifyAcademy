import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getApprovedComments,
  getBlogAuthorById,
  getBlogCategories,
  getBlogSettings,
  getPostBySlug,
  getPrevNextPosts,
  getRelatedPosts,
} from "@/lib/content-modules";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureHeadingIds, renderContent, renderHeadings } from "@/lib/rte";
import { RecordView } from "@/components/blog/record-view";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { Toc } from "@/components/blog/toc";
import { ShareBar } from "@/components/blog/share-bar";
import { HelpfulFeedback } from "@/components/blog/helpful-feedback";
import { Comments } from "@/components/blog/comments";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { BlogCard } from "@/components/blog/blog-cards";
import {
  CourseRecommendation,
  ProductRecommendation,
} from "@/components/blog/recommendations";
import { categoryOf, formatBlogDateLong, formatViews } from "@/lib/blog-utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { getPublishedPosts } = await import("@/lib/content-modules");
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found | Plickify Academy" };

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;

  return {
    title: `${title} | Plickify Academy Blog`,
    description,
    alternates: { canonical: post.canonical_url || `/blog/${post.slug}` },
    robots: post.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${title} | Plickify Academy`,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: post.author_name ? [post.author_name] : undefined,
      images: post.og_image || post.cover_image
        ? [{ url: post.og_image || post.cover_image || "" }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Plickify Academy`,
      description,
      images: post.og_image || post.cover_image ? [post.og_image || post.cover_image || ""] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [categories, settings, related, { prev, next }, comments] =
    await Promise.all([
      getBlogCategories(),
      getBlogSettings(),
      getRelatedPosts(post),
      getPrevNextPosts(post),
      getApprovedComments(post.id),
    ]);

  const author = post.author_id
    ? await getBlogAuthorById(post.author_id)
    : null;

  const supabase = createAdminClient();
  const [feedbackCounts, courseData, productData] = await Promise.all([
    supabase.rpc("blog_feedback_counts", { p_post_id: post.id }).then((r) => ({
      helpful: Number((r.data as { helpful?: number } | null)?.helpful ?? 0),
      not_helpful: Number((r.data as { not_helpful?: number } | null)?.not_helpful ?? 0),
    })),
    post.related_course_id
      ? supabase
          .from("courses")
          .select("title, slug, price, cover_image, category, description")
          .eq("id", post.related_course_id)
          .eq("is_published", true)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    post.related_product_ids.length > 0
      ? supabase
          .from("products")
          .select("name, slug, price, old_price, cover_image, icon, gradient")
          .eq("is_published", true)
          .in("id", post.related_product_ids)
          .limit(4)
      : Promise.resolve({ data: null }),
  ]);
  const course = courseData.data;
  const products = (productData.data ?? []) as ProductLike[];

  const category = categoryOf(post, categories);
  const bodyHtml = ensureHeadingIds(renderContent(post.body ?? ""));
  const headings = renderHeadings(post.body ?? "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_image || post.og_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || undefined,
    author: {
      "@type": "Person",
      name: post.author_name || "Plickify Academy",
    },
    publisher: {
      "@type": "Organization",
      name: "Plickify Academy",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blog/${post.slug}`,
    },
  };

  return (
    <div className="flex-1 bg-zinc-50">
      <RecordView postId={post.id} />
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300" />
          <Link href="/blog" className="hover:text-brand-600">Blog</Link>
          {category && (
            <>
              <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300" />
              <Link
                href={`/blog/category/${category.slug}`}
                className="hover:text-brand-600"
              >
                {category.name}
              </Link>
            </>
          )}
          <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300" />
          <span className="truncate text-zinc-400">{post.title}</span>
        </nav>
        <Link
          href="/blog"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <i className="fa-solid fa-arrow-left" /> Back to Blog
        </Link>

        {/* Header */}
        {category && (
          <Link
            href={`/blog/category/${category.slug}`}
            className="mt-6 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 transition-colors hover:bg-brand-100"
          >
            {category.name}
          </Link>
        )}
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-zinc-200 py-4">
          {author ? (
            <Link
              href={`/blog/author/${author.slug}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <Avatar name={author.name} photo={author.photo} />
              <div>
                <p className="text-sm font-semibold text-zinc-900">{author.name}</p>
                <p className="text-xs text-zinc-500">{author.role || "Author"}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name={post.author_name || "P"} photo={null} />
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {post.author_name || "Plickify Academy"}
                </p>
                <p className="text-xs text-zinc-500">{post.author_role || "Author"}</p>
              </div>
            </div>
          )}
          <span className="hidden text-zinc-300 sm:inline">•</span>
          <span className="text-sm text-zinc-500">
            {formatBlogDateLong(post.published_at)}
          </span>
          <span className="hidden text-zinc-300 sm:inline">•</span>
          {settings.showReadingTime && (
            <>
              <span className="flex items-center gap-1 text-sm text-zinc-500">
                <i className="fa-regular fa-clock" /> {post.reading_time || "5 min read"}
              </span>
              <span className="hidden text-zinc-300 sm:inline">•</span>
            </>
          )}
          {settings.showViewCounter && (
            <span className="flex items-center gap-1 text-sm text-zinc-500">
              <i className="fa-regular fa-eye" /> {formatViews(post.view_count)}
            </span>
          )}
        </div>
      </div>

      {/* Featured image */}
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-lg">
          {post.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <i className="fa-solid fa-newspaper text-6xl text-white/70" />
            </div>
          )}
        </div>
      </div>

      {/* Content + TOC + share */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[250px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <Toc headings={headings} />
          </aside>

          <article className="relative max-w-[740px]">
            <div className="lg:hidden">
              <Toc headings={headings} />
            </div>

            <div
              className="prose-content max-w-none text-[17px]"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {course && (
              <CourseRecommendation
                course={{
                  title: course.title,
                  slug: course.slug,
                  price: course.price,
                  cover_image: course.cover_image,
                  category: course.category,
                  description: course.description,
                }}
              />
            )}
            {products.map((p) => (
              <ProductRecommendation key={p.slug} product={p} />
            ))}

            {settings.shareButtons && <ShareBar title={post.title} />}

            <HelpfulFeedback
              postId={post.id}
              counts={feedbackCounts}
              initial={null}
            />

            {/* Author box */}
            <div className="mt-10 flex flex-col gap-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
              {author ? (
                <Link
                  href={`/blog/author/${author.slug}`}
                  className="shrink-0 transition-opacity hover:opacity-80"
                >
                  <Avatar name={author.name} photo={author.photo} size="lg" />
                </Link>
              ) : (
                <span className="shrink-0">
                  <Avatar name={post.author_name || "P"} photo={null} size="lg" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold text-zinc-900">
                  {post.author_name || "Plickify Academy"}
                </p>
                <p className="text-sm text-zinc-500">
                  {author?.role || post.author_role || "Author"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {author?.bio ||
                    "Plickify Academy-এর লেখক। AI, Freelancing এবং Digital Skills নিয়ে লিখেন।"}
                </p>
                {author && (
                  <Link
                    href={`/blog/author/${author.slug}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View All Articles <i className="fa-solid fa-arrow-right text-xs" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Related articles */}
      <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        {related.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-extrabold text-zinc-900">
              আপনার জন্য আরও কিছু Article
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.id} post={r} categories={categories} />
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next */}
        {(prev || next) && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <i className="fa-solid fa-arrow-left mr-1" /> Previous Article
                </p>
                <p className="mt-2 line-clamp-2 font-semibold text-zinc-900 transition-colors group-hover:text-brand-700">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 text-right transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Next Article <i className="fa-solid fa-arrow-right ml-1" />
                </p>
                <p className="mt-2 line-clamp-2 font-semibold text-zinc-900 transition-colors group-hover:text-brand-700">
                  {next.title}
                </p>
              </Link>
            )}
          </div>
        )}

        {/* Comments */}
        <Comments
          postId={post.id}
          comments={comments}
          likedIds={[]}
          loggedInName={null}
          enabled={settings.commentsEnabled}
        />
      </div>

      {settings.showNewsletter && (
        <div className="pb-12 pt-4">
          <NewsletterCta />
        </div>
      )}
    </div>
  );
}

type ProductLike = {
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  cover_image: string | null;
  icon: string | null;
  gradient: string | null;
};

function Avatar({
  name,
  photo,
  size = "md",
}: {
  name: string;
  photo: string | null;
  size?: "md" | "lg";
}) {
  const cls =
    size === "lg"
      ? "flex h-16 w-16 text-xl"
      : "flex h-11 w-11 text-sm";
  return (
    <span
      className={`${cls} items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.slice(0, 1)
      )}
    </span>
  );
}