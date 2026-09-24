"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOrder, rejectOrder } from "@/lib/actions/payments";
import { useToast } from "@/components/ui/toaster";

type Order = {
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
};

export function OrdersPanel({
  orders,
  emails,
  profiles,
}: {
  orders: Order[];
  emails: Record<string, string>;
  profiles: Record<string, { full_name: string | null; email: string | null }>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const router = useRouter();

  async function run(
    id: string,
    action: (id: string, note?: string) => Promise<{ error?: string }>,
    success: string,
  ) {
    setPendingId(id);
    const result = await action(id, note[id] || undefined);
    setPendingId(null);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast(success);
      router.refresh();
    }
  }

  const statusMeta = (status: string) =>
    status === "paid"
      ? { cls: "wp-tag-green", label: "Paid" }
      : status === "failed"
        ? { cls: "wp-tag-red", label: "Failed" }
        : { cls: "wp-tag-amber", label: "Pending" };

  return (
    <div className="overflow-x-auto">
      <table className="wp-table min-w-[860px]">
        <thead>
          <tr>
            <th>Item</th>
            <th>Student</th>
            <th>Method / TrxID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const meta = statusMeta(order.status);
              const pending = pendingId === order.id;
              const isProduct = !!order.products;
              const profile = profiles[order.user_id];
              const variantName = (() => {
                if (!order.variant_id || !order.products?.variants) return null;
                try {
                  const list = order.products.variants as { id: string; name: string }[];
                  return Array.isArray(list) ? list.find((v) => v.id === order.variant_id)?.name ?? order.variant_id : null;
                } catch { return order.variant_id; }
              })();
              const delivery = (order.products as { delivery_type?: string } | null)?.delivery_type;
              return (
                <tr key={order.id}>
                  <td className="font-semibold text-[#1d2327]">
                    <div>{isProduct ? `${order.products?.name ?? "Product"} (Product)` : order.courses?.title ?? "—"}</div>
                    {variantName && <div className="text-xs font-normal text-[#646970]">Variant: {variantName}</div>}
                    {delivery && <div className="text-xs font-normal capitalize text-[#646970]">{delivery}</div>}
                    {order.access_email && <div className="text-xs font-mono text-[#2271b1]">{order.access_email} / {order.access_whatsapp}</div>}
                  </td>
                  <td className="text-[#3c434a]">
                    <div className="font-medium">{profile?.full_name || emails[order.user_id] || order.user_id.slice(0, 8)}</div>
                    <div className="text-xs text-[#646970]">{profile?.email || emails[order.user_id] || ""}</div>
                    <div className="text-xs font-mono text-[#646970]">{order.user_id.slice(0, 8)}</div>
                  </td>
                  <td className="text-[#3c434a]">
                    {order.payment_method ? (
                      <div className="space-y-0.5">
                        <span className="font-medium capitalize">
                          {order.payment_method === "nagad" ? "Nagad" : "bKash"}
                        </span>
                        {order.trx_id && (
                          <span className="block font-mono text-xs text-[#646970]">
                            {order.trx_id}
                          </span>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="font-medium">
                    ৳{Number(order.amount).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`wp-tag ${meta.cls}`}>{meta.label}</span>
                  </td>
                  <td className="text-[#646970]">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="flex flex-col items-end gap-2">
                      {order.status === "pending" && (
                        <>
                          <textarea
                            placeholder="Admin note for user (e.g. Your order confirmed, check mail, credentials...)"
                            value={note[order.id] || ""}
                            onChange={(e) => setNote((prev) => ({ ...prev, [order.id]: e.target.value }))}
                            className="w-64 rounded border border-zinc-300 px-2 py-1.5 text-xs"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                run(
                                  order.id,
                                  verifyOrder,
                                  isProduct
                                    ? "Payment confirmed — product unlocked"
                                    : "Payment confirmed — course enrolled",
                                )
                              }
                              disabled={pending}
                              className="wp-btn wp-btn-primary"
                            >
                              <i className="fa-solid fa-check" />{" "}
                              {pending ? "..." : "Verify"}
                            </button>
                            <button
                              onClick={() =>
                                run(order.id, rejectOrder, "Order has been marked as failed")
                              }
                              disabled={pending}
                              className="wp-btn wp-btn-danger"
                            >
                              <i className="fa-solid fa-xmark" /> Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="py-10 text-center text-[#646970]">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}