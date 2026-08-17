"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { formatPrice } from "@/lib/format";
import { previewCoupon } from "@/lib/actions/coupons";

type Props = {
  courseId: string;
  price: number;
};

export function CheckoutButton({ courseId, price }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discounted, setDiscounted] = useState<number | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setPending(true);
    try {
      const { amount } = await previewCoupon(courseId, price, code);
      setDiscounted(amount);
      setCouponCode(code.trim().toUpperCase());
      showToast(`কুপন প্রয়োগ হয়েছে — ${formatPrice(amount)}`, "success");
    } catch (e) {
      setCouponCode(null);
      setDiscounted(null);
      showToast((e as Error).message, "error");
    } finally {
      setPending(false);
    }
  }

  async function handleCheckout() {
    setPending(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, couponCode }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPending(false);
      if (data.requiresLogin) {
        router.push("/login");
      } else {
        showToast(data.error ?? "পেমেন্ট শুরু করা যায়নি", "error");
      }
      return;
    }

    const { url } = await res.json();
    setPending(false);
    if (url) window.location.href = url;
  }

  const finalPrice = discounted ?? price;

  return (
    <div className="flex flex-col gap-3">
      {couponCode ? (
        <p className="text-sm font-medium text-green-200">
          <i className="fa-solid fa-ticket mr-1" />
          কুপন <b>{couponCode}</b> প্রয়োগ হয়েছে:{" "}
          <span className="line-through opacity-70">{formatPrice(price)}</span>{" "}
          → <span className="font-bold">{formatPrice(finalPrice)}</span>
        </p>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="কুপন কোড"
            className="w-36 rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            onClick={handleApply}
            disabled={pending}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-60"
          >
            প্রয়োগ করুন
          </button>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={pending}
        className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
      >
        {pending ? "রিডাইরেক্ট হচ্ছে..." : `এখনই কিনুন — ${formatPrice(finalPrice)}`}
      </button>
    </div>
  );
}