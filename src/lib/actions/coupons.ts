"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyCoupon } from "@/lib/coupons";
import { requireAdmin } from "@/lib/actions/admin";

export async function previewCoupon(
  courseId: string,
  price: number,
  code: string,
): Promise<{ amount: number }> {
  const { amount } = await applyCoupon(courseId, price, code);
  return { amount };
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code")).trim().toUpperCase();
  if (!code) throw new Error("কুপন কোড লিখুন");

  const discountType = String(formData.get("discount_type")) as
    | "percent"
    | "flat";
  const value = parseFloat(String(formData.get("value")));
  if (isNaN(value) || value <= 0) throw new Error("সঠিক ডিসকাউন্ট দিন");

  const courseId = String(formData.get("course_id") || "").trim() || null;
  const maxUses = parseInt(String(formData.get("max_uses")), 10) || 0;
  const expiresAt = String(formData.get("expires_at") || "").trim() || null;

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").insert({
    code,
    discount_type: discountType,
    value,
    course_id: courseId,
    max_uses: maxUses,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/coupons");
}