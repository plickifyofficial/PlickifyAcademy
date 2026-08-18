"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { formatPrice } from "@/lib/format";
import { submitManualPayment } from "@/lib/actions/payments";

type Props = {
  courseId: string;
  price: number;
};

export function CheckoutButton({ courseId, price }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const isFree = price <= 0;

  async function handleFreeEnroll() {
    setPending(true);
    const result = await submitManualPayment({
      courseId,
      couponCode: null,
      method: "bkash",
      senderNumber: "",
      trxId: "",
    });
    setPending(false);

    if (result.error) {
      if (result.error === "Please login to make a payment") {
        router.push("/login");
      } else {
        showToast(result.error, "error");
      }
      return;
    }

    router.refresh();
  }

  if (isFree) {
    return (
      <button
        onClick={handleFreeEnroll}
        disabled={pending}
        className="block w-full rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Please wait..." : "Enroll Free"}
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(`/checkout/${courseId}`)}
      disabled={pending}
      className="block w-full rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-60"
    >
      Buy Now — {formatPrice(price)}
    </button>
  );
}