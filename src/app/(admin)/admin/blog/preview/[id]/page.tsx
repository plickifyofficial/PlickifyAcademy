import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderContent } from "@/lib/rte";
import { formatBlogDateLong, estimateReadingTime } from "@/lib/blog-utils";
import { getBlogAuthorById } from "@/lib/content-modules";

export const dynamic = "force-dynamic";

export default async function AdminBlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();

  const bodyHtml = renderContent(post.body ?? "");
  const author = post.author_id
    ? await getBlogAuthorById(post.author_id)
    : null;
  const reading = post.reading_time || estimateReadingTime(post.body ?? "");

  return (
    <main className="bg-white pb-20 pt-8 text-[#1d2327]">
      <div className="mx-auto max-w-[860px] px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f0f1] pb-4 text-sm">
          <Link href={`/admin/blog/posts/${id}/edit`} className="font-semibold text-[#2271b1]">
            <i className="fa-solid fa-arrow-left mr-1" /> Back to editor
          </Link>
          <span className="inline-flex items-center gap-2 text-[#646970]">
            <i className="fa-solid fa-eye text-[#2271b1]" />
            <span className="font-semibold uppercase tracking-wide">Post Preview</span>
            <span
              className={`ml-1 rounded px-2 py-0.5 text-xs font-bold ${
                post.status === "published"
                  ? "bg-emerald-100 text-emerald-700"
                  : post.status === "scheduled"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {post.status}
            </span>
          </span>
        </div>

        <div className="mb-6">
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {author?.name ?? post.author_name ?? "Blog"}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#1d2327] sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 text-lg leading-relaxed text-[#646970]">{post.excerpt}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#8c8f94]">
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-calendar-days" /> {formatBlogDateLong(post.published_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-clock" /> {reading}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="fa-solid fa-eye" /> {post.view_count ?? 0} views
            </span>
          </div>
        </div>

        {post.cover_image && (
          <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#f0f0f1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <article>
          <div
            className="prose-content max-w-none text-[17px]"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </article>

        {author && (
          <div className="mt-10 flex items-start gap-4 rounded-2xl border border-[#e2e2e2] bg-[#fafafa] p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700">
              {author.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.photo} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                author.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#646970]">Written by</p>
              <p className="text-lg font-bold text-[#1d2327]">{author.name}</p>
              {author.role && <p className="text-sm text-[#646970]">{author.role}</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}