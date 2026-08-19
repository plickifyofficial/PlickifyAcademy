"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toaster";

export function BuyButton() {
  const { showToast } = useToast();
  const [buying, setBuying] = useState(false);
  return (
    <button
      onClick={() => {
        if (buying) return;
        setBuying(true);
        setTimeout(() => {
          setBuying(false);
          showToast("Product checkout শীঘ্রই আসছে — payment integration পরের ধাপে যোগ হবে");
        }, 400);
      }}
      className="w-full rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 sm:w-auto"
    >
      <i className="fa-solid fa-cart-shopping mr-2" />
      {buying ? "..." : "এখনই কিনুন"}
    </button>
  );
}