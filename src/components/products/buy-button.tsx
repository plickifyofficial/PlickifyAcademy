"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyButton({
  slug,
  name,
  owned,
}: {
  slug: string;
  name: string;
  owned?: boolean;
}) {
  const router = useRouter();
  const [buying, setBuying] = useState(false);

  if (owned) {
    return (
      <button
        onClick={() => router.push("/dashboard/my-products")}
        className="w-full rounded-full bg-green-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 sm:w-auto"
      >
        <i className="fa-solid fa-download mr-2" />
        Go to My Products
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        if (buying) return;
        setBuying(true);
        router.push(`/checkout/product/${slug}`);
      }}
      className="w-full rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 sm:w-auto"
    >
      <i className="fa-solid fa-cart-shopping mr-2" />
      {buying ? "..." : `এখনই কিনুন — ${name}`}
    </button>
  );
}