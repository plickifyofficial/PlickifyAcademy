"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { formatPrice } from "@/lib/format";

type Props = {
  courseId: string;
  price: number;
};

export function CheckoutButton({ courseId, price }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);

  async function handleCheckout() {
    setPending(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
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

  return (
    <button
      onClick={handleCheckout}
      disabled={pending}
      className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-60"
    >
      {pending ? "রিডাইরেক্ট হচ্ছে..." : `এখনই কিনুন — ${formatPrice(price)}`}
    </button>
  );
}
