import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { CheckoutPanel } from "@/components/checkout/checkout-panel";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();
  if (!course) notFound();

  const { data: enrolled } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (enrolled) redirect(`/courses/${course.slug}`);

  const originalPrice =
    (course.original_price ?? 0) > course.price
      ? course.original_price
      : course.price > 0
        ? course.price * 2
        : 0;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="transition-colors hover:text-brand-600">
          Home
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <Link
          href={`/courses/${course.slug}`}
          className="truncate transition-colors hover:text-brand-600"
        >
          {course.title}
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="font-medium text-zinc-900">Checkout</span>
      </nav>

      <h1 className="mt-6 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>
            <div className="mt-4 flex items-start gap-4">
              <div className="relative flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-2xl font-bold text-white">
                {course.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  course.title.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug text-zinc-900">
                  {course.title}
                </h3>
                {course.subtitle && (
                  <p className="mt-1 text-sm text-zinc-500">{course.subtitle}</p>
                )}
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  <i className="fa-solid fa-infinity mr-1 text-brand-600" />
                  Lifetime access
                  <span className="mx-2 text-zinc-300">·</span>
                  <i className="fa-solid fa-certificate mr-1 text-brand-600" />
                  Certificate on completion
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-zinc-100 pt-4">
              <div>
                {course.price > 0 && originalPrice > course.price && (
                  <span className="mr-2 text-sm text-zinc-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-zinc-900">
                  {formatPrice(course.price)}
                </span>
                {course.price === 0 && (
                  <span className="ml-2 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Free
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900">
              {course.price > 0 ? "Payment Details" : "Enrollment"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {course.price > 0
                ? "Send the amount via bKash or Nagad, then submit your TrxID below."
                : "This course is free — enroll with one click."}
            </p>
            <div className="mt-4">
              <CheckoutPanel courseId={course.id} price={course.price} />
            </div>
            <p className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-500">
              <i className="fa-solid fa-shield-halved text-green-600" />
              Secure Payment · Instant Enrollment · Lifetime Course Access
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}