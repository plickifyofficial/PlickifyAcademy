"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductVariant } from "@/lib/types";

export function VariantPopup({ product, variants, slug }: { product: { name: string; slug: string }; variants: ProductVariant[]; slug: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(variants[0]?.id ?? "");

  if (variants.length === 0) {
    return (
      <Link href={`/checkout/product/${slug}`} className="flex flex-1 items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Buy Now
      </Link>
    );
  }

  const sel = variants.find((v) => v.id === selected) ?? variants[0];

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex flex-1 items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Buy Now
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-bold text-zinc-900">{product.name} — Select Variant</h3>
            <div className="mt-4 space-y-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${selected === v.id ? "border-brand-600 bg-brand-50" : "border-zinc-200 hover:bg-zinc-50"}`}
                >
                  <span className="font-semibold text-zinc-900">{v.name}</span>
                  <span className="font-bold text-brand-600">{formatPrice(Number(v.price))}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-semibold">Cancel</button>
              <Link href={`/checkout/product/${slug}?variant=${selected}`} className="flex flex-1 items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white">Checkout — {formatPrice(Number(sel.price))}</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
