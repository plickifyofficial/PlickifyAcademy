import Link from "next/link";
import type { ProductsContent } from "@/lib/content-schema";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { VariantPopup } from "@/components/products/variant-popup";

export function Products({
  content,
  products,
  hideViewAll = false,
}: {
  content: ProductsContent;
  products?: Product[];
  hideViewAll?: boolean;
}) {
  return (
    <section id="products" className="bg-zinc-50/70 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {content.eyebrow}
          </span>
          <h2 className="mt-3 section-heading font-extrabold text-zinc-900">
            {content.title}
          </h2>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {(products && products.length > 0
            ? products.slice(0, content.limit || 8)
            : content.items
          ).map((product) => {
            const isDb = !!(product as Product).id;
            const name = isDb
              ? (product as Product).name
              : (product as { name: string }).name;
            const tag = isDb
              ? (product as Product).tag ?? ""
              : (product as { tag?: string }).tag ?? "";
            const gradient = isDb
              ? (product as Product).gradient ?? "from-blue-600 to-indigo-600"
              : (product as { gradient?: string }).gradient;
            const icon = isDb
              ? (product as Product).icon ?? "fa-solid fa-file-lines"
              : (product as { icon?: string }).icon;
            const cover = isDb
              ? (product as Product).cover_image
              : null;
            const price = isDb
              ? formatPrice((product as Product).price)
              : (product as { price: string }).price;
            const oldPrice = isDb
              ? (product as Product).old_price > 0
                ? formatPrice((product as Product).old_price)
                : ""
              : (product as { oldPrice?: string }).oldPrice ?? "";
            const description = isDb
              ? (product as Product).description
              : null;

            const slug = isDb ? (product as Product).slug : null;
            const rawVariants = isDb ? ((product as Product).variants as unknown as { price: number; stock_quantity?: string | number | null }[] | null) : null;
            const hasVariants = Array.isArray(rawVariants) && rawVariants.length > 0;
            let isOutOfStock = false;
            if (isDb) {
              if (hasVariants) {
                const hasUnlimited = rawVariants!.some((v) => v.stock_quantity === "" || v.stock_quantity == null);
                const stocks = rawVariants!.map((v) => v.stock_quantity).map((s) => (s === "" || s == null ? null : Number(s))).filter((s): s is number => s != null && Number.isFinite(s));
                const hasPositive = stocks.some((s) => s > 0);
                const allZero = stocks.length > 0 && stocks.every((s) => s <= 0);
                isOutOfStock = !hasUnlimited && !hasPositive && allZero;
              } else {
                const sq = (product as Product).stock_quantity;
                isOutOfStock = sq != null && Number(sq) <= 0;
              }
            }
            const variants = rawVariants as unknown as { price: number }[] | null;
            let displayPrice = price;
            if (isDb && hasVariants) {
              const prices = variants!.map((v) => Number(v.price)).filter((n) => Number.isFinite(n));
              if (prices.length === 1) displayPrice = formatPrice(prices[0]);
              else if (prices.length > 1) displayPrice = `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`;
            }
            const detailHref = slug ? `/digital-products/${slug}` : content.viewAllLink || "/digital-products";
            const buyHref = slug ? `/digital-products/${slug}` : detailHref;

            return (
              <div
                key={isDb ? (product as Product).id : name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-100"
              >
                <Link href={detailHref} className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <i className={`${icon} text-5xl text-white/85`} />
                  )}
                  {tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white backdrop-blur">
                      {tag}
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">Out of Stock</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link href={detailHref}><h3 className="font-bold text-zinc-900 hover:text-brand-600">{name}</h3></Link>
                  {description && <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{description}</p>}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-brand-600">{displayPrice}</span>
                    {oldPrice && <span className="text-sm text-zinc-400 line-through">{oldPrice}</span>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {isOutOfStock ? (
                      <Link href={detailHref} className="flex flex-1 items-center justify-center rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-600">Waitlist</Link>
                    ) : hasVariants ? (
                      <VariantPopup product={{ name, slug: slug! }} variants={variants as unknown as import("@/lib/types").ProductVariant[]} slug={slug!} />
                    ) : (
                      <Link href={buyHref} className="flex flex-1 items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Buy Now</Link>
                    )}
                    <Link href={detailHref} className="flex flex-1 items-center justify-center rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:border-brand-300">Details</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!hideViewAll && (
          <div className="mt-10 text-center" data-aos="fade-up">
            <Link
              href={content.viewAllLink || "/products"}
              className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              {content.viewAllText}
              <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}