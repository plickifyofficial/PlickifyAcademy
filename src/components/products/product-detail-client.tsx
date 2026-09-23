"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { BuyButton } from "@/components/products/buy-button";
import type { Product, ProductVariant } from "@/lib/types";

export function ProductDetailClient({ product, owned }: { product: Product; owned: boolean }) {
  const variants = (product.variants as ProductVariant[] | null) ?? [];
  const hasVariants = variants.length > 0;
  const [selectedId, setSelectedId] = useState<string>(variants[0]?.id ?? "");

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const price = selected ? Number(selected.price) : Number(product.price);
  const oldPrice = selected?.old_price ? Number(selected.old_price) : Number(product.old_price);
  const discount = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const isAccess = product.delivery_type === "access";

  return (
    <>
      {hasVariants && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-zinc-700">Select Variant</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedId === v.id ? "border-brand-600 bg-brand-600 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-300"
                }`}
              >
                {v.name} — {formatPrice(Number(v.price))}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-zinc-100 pt-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold text-brand-600">{price <= 0 ? "Free" : formatPrice(price)}</span>
          {oldPrice > price && <span className="text-xl text-zinc-400 line-through">{formatPrice(oldPrice)}</span>}
          {discount > 0 && <span className="rounded bg-red-600/10 px-2 py-1 text-xs font-bold text-red-600">{discount}% OFF</span>}
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          <i className="fa-solid fa-bolt mr-1 text-brand-500" />
          {isAccess ? "Access via Email & WhatsApp · No Download" : "Instant Download · Lifetime Access"}
        </p>
        {isAccess && <p className="mt-2 text-xs text-amber-600">Checkout will collect your email & WhatsApp for access</p>}
        <div className="mt-5">
          <BuyButton slug={product.slug} name={product.name} owned={owned} variantId={selectedId || undefined} />
        </div>
        <p className="mt-3 text-xs text-zinc-400">Variant: {selected?.name || "Default"} {hasVariants && `(${variants.length} options)`}</p>
      </div>

      {/* Mobile sticky */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden" data-floating-obstacle>
        <div className="safe-bottom mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-brand-600">{price <= 0 ? "Free" : formatPrice(price)}</span>
              {oldPrice > price && <span className="text-sm text-zinc-400 line-through">{formatPrice(oldPrice)}</span>}
            </div>
            <p className="truncate text-xs text-zinc-500">{product.name} {selected ? `— ${selected.name}` : ""}</p>
          </div>
          <Link href={owned ? `/dashboard/my-products` : `/checkout/product/${product.slug}${selectedId ? `?variant=${selectedId}` : ""}`} className="flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white">
            {owned ? "My Downloads" : "Buy Now"} <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </>
  );
}
