import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "ড্যাশবোর্ড" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  if (profile?.role === "instructor") redirect("/admin/courses");

  const [
    { count: courseCount },
    { count: lessonCount },
    { count: studentCount },
    { count: enrollmentCount },
    { data: orders },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id, status, amount, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("enrollments").select("course_id, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  const paidRevenue = (orders ?? [])
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const widgets = [
    {
      label: "কোর্স",
      value: courseCount ?? 0,
      icon: "fa-solid fa-book-open",
      color: "bg-[#f0f6fc] text-[#2271b1]",
      link: "/admin/courses",
    },
    {
      label: "লেসন",
      value: lessonCount ?? 0,
      icon: "fa-solid fa-file-lines",
      color: "bg-[#fef8ee] text-[#996800]",
      link: "/admin/courses",
    },
    {
      label: "স্টুডেন্ট",
      value: studentCount ?? 0,
      icon: "fa-solid fa-users",
      color: "bg-[#edfaef] text-[#007017]",
      link: "/admin/students",
    },
    {
      label: "এনরোলমেন্ট",
      value: enrollmentCount ?? 0,
      icon: "fa-solid fa-user-check",
      color: "bg-[#fcf0f1] text-[#b32d2e]",
      link: "/admin/students",
    },
    {
      label: "রেভিনিউ",
      value: `৳${paidRevenue.toLocaleString("en-IN")}`,
      icon: "fa-solid fa-sack-dollar",
      color: "bg-[#f0f6fc] text-[#2271b1]",
      link: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="wp-page-title">ড্যাশবোর্ড</h1>
      <p className="wp-subtitle">প্লিকিফাই অ্যাকাডেমির সার্বিক অবস্থা</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {widgets.map((w) => (
          <div key={w.label} className="wp-panel">
            <div className="wp-panel-body">
              <span className={`flex h-10 w-10 items-center justify-center rounded ${w.color}`}>
                <i className={w.icon} />
              </span>
              <p className="mt-3 text-2xl font-bold text-[#1d2327]">{w.value}</p>
              <p className="text-sm text-[#646970]">{w.label}</p>
              <Link
                href={w.link}
                className="mt-3 inline-block text-xs font-medium text-[#2271b1] hover:text-[#135e96]"
              >
                আরও দেখুন →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="wp-panel lg:col-span-2">
          <div className="wp-panel-header">
            সাম্প্রতিক অর্ডার
            <Link href="/admin/orders" className="text-xs font-medium text-[#2271b1] hover:text-[#135e96]">
              সব দেখুন →
            </Link>
          </div>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="wp-table">
                <thead>
                  <tr>
                    <th>স্ট্যাটাস</th>
                    <th>পরিমাণ</th>
                    <th>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span
                          className={`wp-tag ${
                            order.status === "paid"
                              ? "wp-tag-green"
                              : order.status === "failed"
                                ? "wp-tag-red"
                                : "wp-tag-amber"
                          }`}
                        >
                          {order.status === "paid"
                            ? "পেইড"
                            : order.status === "failed"
                              ? "ব্যর্থ"
                              : "পেন্ডিং"}
                        </span>
                      </td>
                      <td className="font-semibold text-[#3c434a]">
                        ৳{Number(order.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="text-[#646970]">
                        {new Date(order.created_at).toLocaleDateString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-6 text-sm text-[#646970]">
              এখনো কোনো অর্ডার নেই। Stripe keys set করার পর পেমেন্ট চালু হবে।
            </p>
          )}
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">দ্রুত অ্যাকশন</div>
          <div className="wp-panel-body space-y-2">
            <Link href="/admin/courses?add=1" className="wp-btn wp-btn-primary w-full">
              <i className="fa-solid fa-plus" /> নতুন কোর্স
            </Link>
            <Link href="/admin/courses" className="wp-btn w-full">
              <i className="fa-solid fa-book-open" /> কোর্স ম্যানেজ
            </Link>
            <Link href="/admin/students" className="wp-btn w-full">
              <i className="fa-solid fa-users" /> স্টুডেন্ট ম্যানেজ
            </Link>
            <Link href="/admin/media" className="wp-btn w-full">
              <i className="fa-solid fa-images" /> মিডিয়া লাইব্রেরি
            </Link>
            <Link href="/admin/settings" className="wp-btn w-full">
              <i className="fa-solid fa-sliders" /> সাইট সেটিংস
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 wp-panel">
        <div className="wp-panel-header">সাম্প্রতিক এনরোলমেন্ট</div>
        {recentEnrollments && recentEnrollments.length > 0 ? (
          <div className="wp-panel-body space-y-3">
            {recentEnrollments.map((e) => (
              <div key={`${e.course_id}-${e.created_at}`} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f6fc] text-[#2271b1]">
                  <i className="fa-solid fa-user-plus text-xs" />
                </span>
                <span className="flex-1 truncate text-[#3c434a]">
                  নতুন এনরোলমেন্ট
                </span>
                <span className="text-xs text-[#646970]">
                  {new Date(e.created_at).toLocaleDateString("bn-BD")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-[#646970]">এখনো কোনো এনরোলমেন্ট নেই।</p>
        )}
      </div>
    </div>
  );
}