import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "পেমেন্ট এখনো চালু হয়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ requiresLogin: true }, { status: 401 });
  }

  const { courseId } = await request.json();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();

  if (error || !course) {
    return NextResponse.json({ error: "কোর্সটি পাওয়া যায়নি" }, { status: 404 });
  }

  if (course.price === 0) {
    await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: course.id,
    });
    return NextResponse.json({ url: `${appUrl}/dashboard` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: course.title,
            description: course.description ?? undefined,
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: user.id,
    },
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/courses/${course.slug}`,
  });

  return NextResponse.json({ url: session.url });
}
