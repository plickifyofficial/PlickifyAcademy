import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "অর্ডারসমূহ" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, courses(title)")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  const emails: Record<string, string> = {};
  if (userIds.length > 0) {
    const admin = createAdminClient();
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 200 });
    for (const u of authUsers?.users ?? []) {
      emails[u.id] = u.email ?? "";
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">অর্ডারসমূহ</h1>
      <p className="mt-1 text-sm text-zinc-500">
        পেমেন্ট ও এনরোলমেন্ট হিস্ট্রি
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">কোর্স</th>
              <th className="px-4 py-3">স্টুডেন্ট</th>
              <th className="px-4 py-3">পরিমাণ</th>
              <th className="px-4 py-3">স্ট্যাটাস</th>
              <th className="px-4 py-3">তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {(order.courses as unknown as { title: string })?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {emails[order.user_id] ?? order.user_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-700">
                    ৳{Number(order.amount).toLocaleString("en-IN")}
                  </td>
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
                      {order.status === "paid"
                        ? "পেইড"
                        : order.status === "failed"
                          ? "ব্যর্থ"
                          : "পেন্ডিং"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  এখনো কোনো অর্ডার নেই। Stripe keys set করার পর পেমেন্ট চালু হবে।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}