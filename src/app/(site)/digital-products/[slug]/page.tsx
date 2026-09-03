import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { BuyButton } from "@/components/products/buy-button";
import { ProseContent } from "@/components/editor/prose-content";
import { renderContent } from "@/lib/rte";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
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
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return {
    title: data ? `${data.name} | Plickify Academy` : "Digital Product",
    description: data?.description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!product) notFound();

  let owned = false;

  const discount =
    product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;

  const stats = [
    { icon: "fa-solid fa-box", label: "Resources", value: `${product.file_count || 0}+` },
    { icon: "fa-solid fa-file", label: "Format", value: product.file_format || "—" },
    { icon: "fa-solid fa-hard-drive", label: "Size", value: product.file_size || "—" },
    { icon: "fa-solid fa-download", label: "Downloads", value: `${product.download_count || 0}+` },
  ];

  return (
    <main className="bg-[#f6f9ff]">
      <div className="px-4 pb-32 pt-16 sm:px-6 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/digital-products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            সব প্রোডাক্ট
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-brand-600/5 lg:grid lg:grid-cols-2">
            <div
              className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br ${
                product.gradient || "from-blue-600 to-indigo-600"
              }`}
            >
              {product.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.cover_image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <i
                  className={`${product.icon || "fa-solid fa-file-lines"} text-7xl text-white/85`}
                />
              )}
              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="flex flex-col p-8 lg:p-12">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  {product.category || "Digital Product"}
                </span>
                {product.product_type && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {product.product_type}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold text-zinc-900">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <i
                    key={i}
                    className={`fa-solid fa-star text-sm ${
                      i <= Math.round(product.rating_avg || 0)
                        ? "text-amber-400"
                        : "text-zinc-200"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-zinc-700">
                  {Number(product.rating_avg || 0).toFixed(1)}
                </span>
                <span className="text-sm text-zinc-400">
                  ({product.review_count || 0} Reviews)
                </span>
              </div>
              <p className="mt-4 text-zinc-500">
              <ProseContent html={renderContent(product.description)} />
            </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-center"
                  >
                    <i className={`${m.icon} text-brand-500`} />
                    <p className="mt-1 truncate text-sm font-bold text-zinc-900">
                      {m.value}
                    </p>
                    <p className="text-xs text-zinc-400">{m.label}</p>
                  </div>
                ))}
              </div>

              {(product.tags?.length ?? 0) > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {(product.tags ?? []).slice(0, 10).map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-zinc-100 pt-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-brand-600">
                    {product.price <= 0 ? "Free" : formatPrice(product.price)}
                  </span>
                  {product.old_price > product.price && (
                    <span className="text-xl text-zinc-400 line-through">
                      {formatPrice(product.old_price)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  <i className="fa-solid fa-bolt mr-1 text-brand-500" />
                  Instant Download · Lifetime Access
                </p>
                <div className="mt-5">
                  <BuyButton slug={product.slug} name={product.name} owned={owned} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden" data-floating-obstacle>
        <div className="safe-bottom mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-brand-600">
                {product.price <= 0 ? "Free" : formatPrice(product.price)}
              </span>
              {product.old_price > product.price && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-zinc-500">{product.name}</p>
          </div>
          <Link
            href={owned ? `/dashboard/my-products` : `/checkout/product/${product.slug}`}
            className="flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
          >
            {owned ? "My Downloads" : "Buy Now"}
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </main>
  );
}