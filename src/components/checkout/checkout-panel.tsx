"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export function CheckoutPanel({ courseId, price }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discounted, setDiscounted] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  const isFree = price <= 0;
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

  async function handleSubmit() {
    setPending(true);
    const result = await submitManualPayment({
      courseId,
      couponCode: isFree ? null : couponCode,
      method: isFree ? "bkash" : method,
      senderNumber: isFree ? "" : senderNumber,
      trxId: isFree ? "" : trxId,
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

    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-400/50 bg-green-50 p-6">
        <p className="font-semibold text-green-800">
          <i className="fa-solid fa-check-circle mr-1" />
          {isFree
            ? "Enrolled successfully!"
            : "Payment submitted — enrollment is under review"}
        </p>
        <p className="mt-2 text-sm text-green-700">
          {isFree
            ? "You now have access to this course. Start learning right away."
            : `We'll verify your TrxID (${trxId}) and enroll you in the course. It usually takes 5–30 minutes.`}
        </p>
        <Link
          href="/dashboard/courses"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <i className="fa-solid fa-graduation-cap mr-1" /> Go to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!isFree && (
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Coupon Code (optional)
          </label>
          {couponCode ? (
            <p className="rounded-lg border border-green-400/50 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800">
              <i className="fa-solid fa-ticket mr-1" />
              Coupon <b>{couponCode}</b> applied:{" "}
              <span className="line-through opacity-70">
                {formatPrice(price)}
              </span>{" "}
              → <span className="font-bold">{formatPrice(finalPrice)}</span>
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                onClick={handleApply}
                disabled={pending}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {isFree ? (
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Please wait..." : "Enroll Free"}
        </button>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-base font-bold text-zinc-900">
            Make Payment — {formatPrice(finalPrice)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            1. Send <b className="text-zinc-700">{formatPrice(finalPrice)}</b>{" "}
            to the number below using your bKash / Nagad app
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMethod("bkash")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                method === "bkash"
                  ? "bg-pink-600 text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              bKash
            </button>
            <button
              type="button"
              onClick={() => setMethod("nagad")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                method === "nagad"
                  ? "bg-orange-600 text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Nagad
            </button>
          </div>

          <div className="mt-3 rounded-lg bg-zinc-100 px-3 py-3 text-center text-lg font-bold tracking-wider text-zinc-900">
            {merchantNumber || "Number not set — contact support"}
          </div>

          <div className="mt-4 space-y-2.5">
            <input
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder={`Your ${method === "bkash" ? "bKash" : "Nagad"} number`}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <input
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="Transaction ID (TrxID)"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={pending || !trxId.trim() || !senderNumber.trim()}
            className="mt-4 w-full rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Submit Payment"}
          </button>
        </div>
      )}
    </div>
  );
}