import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrdersPanel } from "@/components/admin/orders-panel";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, courses(title), products(name, delivery_type, variants)")
    .order("created_at", { ascending: false }) as unknown as { data: Array<import("@/lib/types").Order & { courses: { title: string } | null; products: { name: string } | null }> | null };

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  const emails: Record<string, string> = {};
  const profiles: Record<string, { full_name: string | null; email: string | null; avatar_url: string | null }> = {};
  if (userIds.length > 0) {
    const admin = createAdminClient();
    const { data: authUsers } = await admin.auth.admin.listUsers({
      perPage: 200,
    });
    for (const u of authUsers?.users ?? []) {
      emails[u.id] = u.email ?? "";
    }
    const { data: profs } = await supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", userIds);
    for (const p of profs ?? []) {
      profiles[p.id] = { full_name: p.full_name, email: (p as { email?: string }).email ?? emails[p.id] ?? "", avatar_url: (p as { avatar_url?: string | null }).avatar_url ?? null };
    }
  }

  return (
    <div>
      <h1 className="wp-page-title">Orders</h1>
      <p className="wp-subtitle">
        Verify manual payments (bKash/Nagad) — verification auto-enrolls courses
        and unlocks products
      </p>

      <div className="wp-panel">
        <div className="wp-panel-header">
          All Orders
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
              course_id: string | null;
              product_id: string | null;
              amount: number;
              status: string;
              payment_method?: string | null;
              trx_id?: string | null;
              variant_id?: string | null;
              access_email?: string | null;
              access_whatsapp?: string | null;
              courses: { title: string } | null;
              products: { name: string; delivery_type?: string; variants?: unknown } | null;
            }[]
          }
          emails={emails}
          profiles={profiles}
        />
      </div>
    </div>
  );
}