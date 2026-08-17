import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WishlistCard } from "@/components/dashboard/wishlist-card";

export const metadata = { title: "পছন্দের তালিকা" };

type WishlistCourse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  price: number;
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: wishlist } = await supabase
    .from("wishlist")
    .select("course_id, created_at, courses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const courses = (wishlist ?? [])
    .map((w) => w.courses as unknown as WishlistCourse | null)
    .filter((c): c is WishlistCourse => !!c);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">পছন্দের তালিকা</h1>
      <p className="mt-1 text-sm text-zinc-500">
        পরে শেখার জন্য যেসব কোর্স সেভ করেছেন
      </p>

      {courses.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <WishlistCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <p className="text-zinc-600">পছন্দের তালিকা খালি আছে।</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            কোর্স ব্রাউজ করুন
          </Link>
        </div>
      )}
    </div>
  );
}