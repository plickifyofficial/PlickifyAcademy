"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { formatPrice } from "@/lib/format";
import { previewCoupon } from "@/lib/actions/coupons";
import { submitManualPayment } from "@/lib/actions/payments";

const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "";
const NAGAD_NUMBER = process.env.NEXT_PUBLIC_NAGAD_NUMBER ?? "";

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

  const [step, setStep] = useState<"idle" | "pay" | "done">("idle");
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  const finalPrice = discounted ?? price;
  const merchantNumber = method === "bkash" ? BKASH_NUMBER : NAGAD_NUMBER;

  async function handleApply() {
    if (!code.trim()) return;
    setPending(true);
    try {
      const { amount } = await previewCoupon(courseId, price, code);
      setDiscounted(amount);
      setCouponCode(code.trim().toUpperCase());
      showToast(`Coupon applied — ${formatPrice(amount)}`, "success");
    } catch (e) {
      setCouponCode(null);
      setDiscounted(null);
      showToast((e as Error).message, "error");
    } finally {
      setPending(false);
    }
  }

  async function handleSubmitPayment() {
    setPending(true);
    const result = await submitManualPayment({
      courseId,
      couponCode,
      method,
      senderNumber,
      trxId,
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

    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="rounded-xl border border-green-400/40 bg-green-500/15 p-4 text-white">
        <p className="font-semibold">
          <i className="fa-solid fa-check-circle mr-1" /> Payment submitted!
        </p>
        <p className="mt-1 text-sm text-white/80">
          We'll verify your TrxID ({trxId}) and enroll you in the course. It usually
          takes 5–30 minutes. You'll get a notification once enrolled.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {couponCode ? (
        <p className="text-sm font-medium text-green-200">
          <i className="fa-solid fa-ticket mr-1" />
          Coupon <b>{couponCode}</b> applied:{" "}
          <span className="line-through opacity-70">{formatPrice(price)}</span>{" "}
          → <span className="font-bold">{formatPrice(finalPrice)}</span>
        </p>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon Code"
            className="w-36 rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            onClick={handleApply}
            disabled={pending}
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-60"
          >
            Apply
          </button>
        </div>
      )}

      {step === "idle" && (
        <button
          onClick={() => setStep("pay")}
          disabled={pending}
          className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
        >
          {pending ? "Please wait..." : `Buy Now — ${formatPrice(finalPrice)}`}
        </button>
      )}

      {step === "pay" && (
        <div className="rounded-xl border border-white/30 bg-white/10 p-4 text-white">
          <p className="text-sm font-semibold">Make Payment</p>
          <p className="mt-1 text-sm text-white/80">
            1. Send <b>{formatPrice(finalPrice)}</b> to the number below
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setMethod("bkash")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                method === "bkash"
                  ? "bg-pink-600 text-white"
                  : "border border-white/40 text-white hover:bg-white/20"
              }`}
            >
              bKash
            </button>
            <button
              type="button"
              onClick={() => setMethod("nagad")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                method === "nagad"
                  ? "bg-orange-600 text-white"
                  : "border border-white/40 text-white hover:bg-white/20"
              }`}
            >
              Nagad
            </button>
          </div>

          <div className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-center text-lg font-bold tracking-wider">
            {merchantNumber || "Number not set"}
          </div>

          <div className="mt-3 space-y-2">
            <input
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder={`Your ${method === "bkash" ? "bKash" : "Nagad"} number`}
              className="w-full rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <input
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="Transaction ID (TrxID)"
              className="w-full rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <button
            onClick={handleSubmitPayment}
            disabled={pending || !trxId.trim() || !senderNumber.trim()}
            className="mt-3 w-full rounded-lg bg-white px-6 py-2.5 font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Submit Payment"}
          </button>
        </div>
      )}
    </div>
  );
}