"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import {
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} from "@/lib/actions/coupons";
import type { Coupon } from "@/lib/types";

type Props = {
  coupons: Coupon[];
  courses: { id: string; title: string }[];
};

export function CouponsPanel({ coupons, courses }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await createCoupon(new FormData(e.currentTarget));
      showToast("Coupon created", "success");
      router.refresh();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setPending(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    try {
      await toggleCoupon(id, isActive);
      router.refresh();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCoupon(id);
      showToast("Coupon deleted", "success");
      router.refresh();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleCreate}
        className="wp-card h-fit rounded-lg border border-black/10 bg-white p-5"
      >
        <h2 className="mb-4 text-sm font-semibold text-zinc-800">
          New Coupon
        </h2>

        <label className="wp-label">Coupon Code</label>
        <input
          name="code"
          required
          placeholder="PLICKIFY20"
          className="wp-input mb-3"
        />

        <label className="wp-label">Discount Type</label>
        <select name="discount_type" className="wp-input mb-3">
          <option value="percent">Percentage (%)</option>
          <option value="flat">Flat (৳)</option>
        </select>

        <label className="wp-label">Value</label>
        <input
          name="value"
          type="number"
          min="1"
          step="0.01"
          required
          placeholder="20"
          className="wp-input mb-3"
        />

        <label className="wp-label">Course (Optional)</label>
        <select name="course_id" className="wp-input mb-3">
          <option value="">Applies to all courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <label className="wp-label">Max Uses (0 = Unlimited)</label>
        <input
          name="max_uses"
          type="number"
          min="0"
          defaultValue="0"
          className="wp-input mb-3"
        />

        <label className="wp-label">Expires (Optional)</label>
        <input name="expires_at" type="datetime-local" className="wp-input mb-4" />

        <button
          disabled={pending}
          className="wp-btn wp-btn-primary w-full"
        >
          {pending ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      <div className="space-y-3 lg:col-span-2">
        {coupons.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            No coupons yet.
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-black/10 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#f0f6fc] px-2 py-0.5 font-mono text-sm font-bold text-[#2271b1]">
                    {coupon.code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      coupon.discount_type === "percent"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {coupon.discount_type === "percent"
                      ? `${coupon.value}%`
                      : `৳${coupon.value}`}
                  </span>
                  {!coupon.is_active && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {coupon.course_id ? "Specific course" : "All courses"} • Used{" "}
                  {coupon.used_count}
                  {coupon.max_uses > 0 ? `/${coupon.max_uses}` : ""}
                  {coupon.expires_at && (
                    <>
                      {" "}
                      • Expires:{" "}
                      {new Date(coupon.expires_at).toLocaleDateString("en-US")}
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={() => handleToggle(coupon.id, !coupon.is_active)}
                className={`rounded border px-3 py-1.5 text-xs font-semibold ${
                  coupon.is_active
                    ? "border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                    : "border-green-300 text-green-700 hover:bg-green-50"
                }`}
              >
                {coupon.is_active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}