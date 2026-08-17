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
      <h1 className="wp-page-title">অর্ডারসমূহ</h1>
      <p className="wp-subtitle">পেমেন্ট ও এনরোলমেন্ট হিস্ট্রি</p>

      <div className="wp-panel">
        <div className="wp-panel-header">
          সব অর্ডার
          <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
            {orders?.length ?? 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="wp-table min-w-[680px]">
            <thead>
              <tr>
                <th>কোর্স</th>
                <th>স্টুডেন্ট</th>
                <th>পরিমাণ</th>
                <th>স্ট্যাটাস</th>
                <th>তারিখ</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-semibold text-[#1d2327]">
                      {(order.courses as unknown as { title: string })?.title ?? "—"}
                    </td>
                    <td className="text-[#3c434a]">
                      {emails[order.user_id] ?? order.user_id.slice(0, 8)}
                    </td>
                    <td className="font-medium">
                      ৳{Number(order.amount).toLocaleString("en-IN")}
                    </td>
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
                    <td className="text-[#646970]">
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
                  <td colSpan={5} className="py-10 text-center text-[#646970]">
                    এখনো কোনো অর্ডার নেই। Stripe keys set করার পর পেমেন্ট চালু হবে।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}