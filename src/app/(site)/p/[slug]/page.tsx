import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProseContent } from "@/components/editor/prose-content";

export const revalidate = 60;

type PageRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  is_published: boolean;
};

async function getPage(slug: string): Promise<PageRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("custom_pages")
    .select("id, slug, title, body, is_published")
    .eq("slug", slug)
    .maybeSingle();

  if (!data || !data.is_published) return null;
  return data;
}

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("custom_pages")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.body.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="flex-1 bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <h1 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
          {page.title}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-brand-500" />

        <div className="prose-content mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <ProseContent html={page.body} />
        </div>

        <p className="mt-8 text-center text-sm text-zinc-400">
          <Link href="/" className="font-semibold text-brand-600 hover:underline">
            <i className="fa-solid fa-arrow-left mr-1.5 text-xs" />
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
