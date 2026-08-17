"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";
import { applyCoupon } from "@/lib/coupons";

export async function submitManualPayment(input: {
  courseId: string;
  couponCode?: string | null;
  method: string;
  senderNumber: string;
  trxId: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "পেমেন্ট করতে লগইন করুন" };

  const courseId = input.courseId;
  const method = input.method === "nagad" ? "nagad" : "bkash";
  const senderNumber = input.senderNumber.trim();
  const trxId = input.trxId.trim().toUpperCase();

  if (!courseId) return { error: "কোর্স পাওয়া যায়নি" };
  if (!senderNumber || !trxId)
    return { error: "প্রেরকের নাম্বার ও TrxID দিন" };

  const { data: course } = await supabase
    .from("courses")
    .select("id, price, title")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();
  if (!course) return { error: "কোর্সটি পাওয়া যায়নি" };

  const admin = createAdminClient();

  const { data: enrolled } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (enrolled) return { error: "আপনি ইতিমধ্যে এই কোর্সে এনরোলড" };

  const { data: pendingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingOrder)
    return { error: "আপনার একটি পেমেন্ট রিভিউ চলছে — অপেক্ষা করুন" };

  let amount = Number(course.price);
  let couponId: string | null = null;

  if (input.couponCode?.trim()) {
    try {
      const { amount: discounted, coupon } = await applyCoupon(
        courseId,
        Number(course.price),
        input.couponCode,
      );
      amount = discounted;
      couponId = coupon.id;
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  if (amount <= 0) {
    await admin
      .from("enrollments")
      .upsert(
        { user_id: user.id, course_id: courseId },
        { onConflict: "user_id,course_id" },
      );
    return {};
  }

  const { error } = await admin.from("orders").insert({
    user_id: user.id,
    course_id: courseId,
    amount,
    status: "pending",
    payment_method: method,
    trx_id: trxId,
    coupon_id: couponId ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

export async function verifyOrder(
  orderId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (!order) return { error: "অর্ডার পাওয়া যায়নি" };
  if (order.status === "paid") {
    revalidatePath("/admin/orders");
    return {};
  }

  const { error } = await admin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId);
  if (error) return { error: error.message };

  await admin
    .from("enrollments")
    .upsert(
      { user_id: order.user_id, course_id: order.course_id },
      { onConflict: "user_id,course_id" },
    );

  if (order.coupon_id) {
    try {
      await admin.rpc("increment_coupon_used", { coupon_id: order.coupon_id });
    } catch {
      // non-critical
    }
  }

  try {
    await admin.from("notifications").insert({
      user_id: order.user_id,
      title: "পেমেন্ট নিশ্চিত হয়েছে ✅",
      body: "আপনার পেমেন্ট যাচাই হয়েছে — কোর্সটি এনরোল হয়েছে। শেখা শুরু করুন!",
      link: "/dashboard",
    });
  } catch {
    // non-critical
  }

  revalidatePath("/admin/orders");
  return {};
}

export async function rejectOrder(
  orderId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (!order) return { error: "অর্ডার পাওয়া যায়নি" };
  if (order.status !== "pending") {
    revalidatePath("/admin/orders");
    return {};
  }

  const { error } = await admin
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId);
  if (error) return { error: error.message };

  try {
    await admin.from("notifications").insert({
      user_id: order.user_id,
      title: "পেমেন্ট যাচাই হয়নি",
      body: "আপনার পেমেন্টটি যাচাই করা যায়নি। TrxID মিলিয়ে আবার চেষ্টা করুন, অথবা আমাদের সাথে যোগাযোগ করুন।",
      link: "/dashboard",
    });
  } catch {
    // non-critical
  }

  revalidatePath("/admin/orders");
  return {};
}