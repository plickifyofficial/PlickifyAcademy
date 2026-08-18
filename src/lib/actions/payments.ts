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

  if (!user) return { error: "Please login to make a payment" };

  const courseId = input.courseId;
  const method = input.method === "nagad" ? "nagad" : "bkash";
  const senderNumber = input.senderNumber.trim();
  const trxId = input.trxId.trim().toUpperCase();

  if (!courseId) return { error: "Course not found" };

  const { data: course } = await supabase
    .from("courses")
    .select("id, price, title")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();
  if (!course) return { error: "Course not found" };

  const admin = createAdminClient();

  const { data: enrolled } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (enrolled) return { error: "You are already enrolled in this course" };

  const { data: pendingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "pending")
    .maybeSingle();
  if (pendingOrder)
    return { error: "Your payment is under review — please wait" };

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
    revalidatePath("/dashboard");
    return {};
  }

  if (!senderNumber || !trxId)
    return { error: "Please provide your sender number and TrxID" };

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
  if (!order) return { error: "Order not found" };
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
      title: "Payment confirmed ✅",
      body: "Your payment has been verified — the course is enrolled. Start learning!",
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
  if (!order) return { error: "Order not found" };
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
      title: "Payment verification failed",
      body: "Your payment could not be verified. Please check the TrxID and try again, or contact us.",
      link: "/dashboard",
    });
  } catch {
    // non-critical
  }

  revalidatePath("/admin/orders");
  return {};
}