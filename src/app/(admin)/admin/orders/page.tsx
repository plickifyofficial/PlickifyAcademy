import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrdersPanel } from "@/components/admin/orders-panel";

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
    const { data: authUsers } = await admin.auth.admin.listUsers({
      perPage: 200,
    });
    for (const u of authUsers?.users ?? []) {
      emails[u.id] = u.email ?? "";
    }
  }

  return (
    <div>
      <h1 className="wp-page-title">অর্ডারসমূহ</h1>
      <p className="wp-subtitle">
        ম্যানুয়াল পেমেন্ট (bKash/Nagad) ভেরিফাই করুন — ভেরিফাই করলে কোর্স
        স্বয়ংক্রিয়ভাবে এনরোল হবে
      </p>

      <div className="wp-panel">
        <div className="wp-panel-header">
          সব অর্ডার
          <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
            {orders?.length ?? 0}
          </span>
        </div>
        <OrdersPanel
          orders={
            (orders ?? []) as unknown as {
              id: string;
              created_at: string;
              user_id: string;
              course_id: string;
              amount: number;
              status: string;
              payment_method?: string | null;
              trx_id?: string | null;
              courses: { title: string } | null;
            }[]
          }
          emails={emails}
        />
      </div>
    </div>
  );
}