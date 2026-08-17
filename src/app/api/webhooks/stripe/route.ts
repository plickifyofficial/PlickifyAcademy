import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (courseId && userId) {
      const supabase = await createClient();

      await supabase.from("orders").upsert(
        {
          user_id: userId,
          course_id: courseId,
          stripe_session_id: session.id,
          amount,
          status: "paid",
        },
        { onConflict: "stripe_session_id" },
      );

      await supabase
        .from("enrollments")
        .upsert(
          { user_id: userId, course_id: courseId },
          { onConflict: "user_id,course_id" },
        );

      if (session.metadata?.couponId) {
        await supabase.rpc("increment_coupon_used", {
          coupon_id: session.metadata.couponId,
        });
      }

      await createAdminClient().from("notifications").insert({
        user_id: userId,
        title: "পেমেন্ট সফল হয়েছে ✅",
        body: "আপনার কোর্সটি এনরোল হয়ে গেছে। শেখা শুরু করুন!",
        link: "/dashboard",
      });
    }
  }

  return NextResponse.json({ received: true });
}
