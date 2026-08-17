import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "অ্যাডমিন ড্যাশবোর্ড" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: courseCount }, { count: lessonCount }, { count: studentCount }, { count: enrollmentCount }, { data: orders }] =
    await Promise.all([
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("enrollments").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("status, amount").order("created_at", { ascending: false }).limit(5),
    ]);

  const revenue = (orders ?? [])
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const widgets = [
    { label: "মোট কোর্স", value: courseCount ?? 0, icon: "fa-solid fa-graduation-cap", color: "bg-indigo-50 text-indigo-600" },
    { label: "মোট লেসন", value: lessonCount ?? 0, icon: "fa-solid fa-file-lines", color: "bg-amber-50 text-amber-600" },
    { label: "স্টুডেন্ট", value: studentCount ?? 0, icon: "fa-solid fa-users", color: "bg-green-50 text-green-600" },
    { label: "এনরোলমেন্ট", value: enrollmentCount ?? 0, icon: "fa-solid fa-book-open", color: "bg-purple-50 text-purple-600" },
    { label: "রেভিনিউ", value: `৳${revenue.toLocaleString("en-IN")}`, icon: "fa-solid fa-sack-dollar", color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">ড্যাশবোর্ড</h1>
      <p className="mt-1 text-sm text-zinc-500">
        প্লিকিফাই অ্যাকাডেমির সার্বিক অবস্থা
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {widgets.map((w) => (
          <div key={w.label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${w.color}`}>
              <i className={w.icon} />
            </div>
            <p className="mt-3 text-2xl font-bold text-zinc-900">{w.value}</p>
            <p className="text-sm text-zinc-500">{w.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 p-4">
          <h2 className="font-semibold text-zinc-900">সাম্প্রতিক অর্ডার</h2>
        </div>
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-700">
                      ৳{Number(order.amount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-sm text-zinc-500">এখনো কোনো অর্ডার নেই।</p>
        )}
      </div>
    </div>
  );
}