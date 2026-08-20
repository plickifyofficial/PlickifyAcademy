import Link from "next/link";
import type { BlogCategory, BlogPost } from "@/lib/types";
import {
  badgeFor,
  categoryOf,
  formatBlogDate,
  formatViews,
} from "@/lib/blog-utils";
import { markdownToText } from "@/lib/markdown";

export function BlogCard({
  post,
  categories,
}: {
  post: BlogPost;
  categories: BlogCategory[];
}) {
  const category = categoryOf(post, categories);
  const badge = badgeFor(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/5"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <i className="fa-solid fa-newspaper text-4xl text-white/70" />
          </div>
        )}
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full ${badge.className} px-3 py-1 text-[10px] font-extrabold tracking-wider text-white shadow-md`}
          >
            {badge.label.toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs">
          {category ? (
            <span className="font-bold uppercase tracking-wider text-brand-600">
              {category.name}
            </span>
          ) : (
            (post.tags ?? []).slice(0, 1).map((t) => (
              <span
                key={t}
                className="font-bold uppercase tracking-wider text-brand-600"
              >
                {t}
              </span>
            ))
          )}
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-500">{formatBlogDate(post.published_at)}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-brand-700">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-500">
          {post.excerpt || markdownToText(post.body ?? "")}
        </p>
        <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-[10px] font-bold text-white">
            {(post.author_name || "P").slice(0, 1)}
          </span>
          <span className="truncate font-medium">{post.author_name || "Plickify Academy"}</span>
          <span className="text-zinc-300">•</span>
          <span>{post.reading_time || "5 min read"}</span>
          <span className="ml-auto flex items-center gap-1 text-brand-600">
            Read <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogFeaturedCard({
  post,
  categories,
}: {
  post: BlogPost;
  categories: BlogCategory[];
}) {
  const category = categoryOf(post, categories);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-lg shadow-brand-600/5 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-600/10 lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 lg:aspect-auto lg:min-h-[340px]">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <i className="fa-solid fa-newspaper text-6xl text-white/70" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-extrabold tracking-widest text-white shadow-md">
          FEATURED
        </span>
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <div className="flex items-center gap-2 text-xs">
          {category && (
            <span className="rounded-full bg-brand-50 px-3 py-1 font-bold text-brand-700">
              {category.name}
            </span>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-extrabold leading-tight text-zinc-900 transition-colors group-hover:text-brand-700 sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-zinc-600">
          {post.excerpt || markdownToText(post.body ?? "")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white">
            {(post.author_name || "P").slice(0, 1)}
          </span>
          <span className="font-medium">{post.author_name || "Plickify Academy"}</span>
          <span className="text-zinc-300">•</span>
          <span>{post.reading_time || "5 min read"}</span>
          <span className="text-zinc-300">•</span>
          <span>{formatBlogDate(post.published_at)}</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-eye" /> {formatViews(post.view_count)}
          </span>
        </div>
        <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-brand-700">
          আর্টিকেল পড়ুন <i className="fa-solid fa-arrow-right text-xs" />
        </span>
      </div>
    </Link>
  );
}

export function BlogCardMini({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-50"
    >
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-600 to-brand-900">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <i className="fa-solid fa-newspaper text-zinc-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-zinc-800 transition-colors group-hover:text-brand-700">
          {post.title}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {post.reading_time || "5 min read"}
        </p>
      </div>
    </Link>
  );
}