import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/lib/types";

export async function applyCoupon(
  courseId: string,
  price: number,
  code: string,
): Promise<{ amount: number; coupon: Coupon }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .single();

  if (error || !data) throw new Error("কুপনটি পাওয়া যায়নি");
  const coupon = data as Coupon;

  if (!coupon.is_active) throw new Error("কুপনটি আর সচল নেই");
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses)
    throw new Error("কুপনটির ব্যবহার সীমা শেষ হয়ে গেছে");
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    throw new Error("কুপনটির মেয়াদ শেষ হয়ে গেছে");
  if (coupon.course_id && coupon.course_id !== courseId)
    throw new Error("এই কুপনটি এই কোর্সে ব্যবহার করা যাবে না");

  let amount: number;
  if (coupon.discount_type === "percent") {
    const discount = Math.min(100, coupon.value) / 100;
    amount = Math.max(0, price * (1 - discount));
  } else {
    amount = Math.max(0, price - coupon.value);
  }
  amount = Math.round(amount * 100) / 100;

  return { amount, coupon };
}