import { createClient } from "@/lib/supabase/server";
import { CouponsPanel } from "@/components/admin/coupons-panel";

export const metadata = { title: "কুপনসমূহ" };

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });

  return (
    <div>
      <h1 className="wp-page-title">কুপনসমূহ</h1>
      <p className="wp-subtitle mb-5">
        ডিসকাউন্ট কুপন তৈরি ও ম্যানেজ করুন
      </p>
      <CouponsPanel
        coupons={coupons ?? []}
        courses={courses ?? []}
      />
    </div>
  );
}