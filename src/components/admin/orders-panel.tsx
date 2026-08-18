"use client";

import { useState } from "react";
import { verifyOrder, rejectOrder } from "@/lib/actions/payments";
import { useToast } from "@/components/ui/toaster";

type Order = {
  id: string;
  created_at: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: string;
  payment_method?: string | null;
  trx_id?: string | null;
  courses: { title: string } | null;
};

export function OrdersPanel({
  orders,
  emails,
}: {
  orders: Order[];
  emails: Record<string, string>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function run(
    id: string,
    action: (id: string) => Promise<{ error?: string }>,
    success: string,
  ) {
    setPendingId(id);
    const result = await action(id);
    setPendingId(null);
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast(success);
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
            <th>Course</th>
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
              return (
                <tr key={order.id}>
                  <td className="font-semibold text-[#1d2327]">
                    {order.courses?.title ?? "—"}
                  </td>
                  <td className="text-[#3c434a]">
                    {emails[order.user_id] ?? order.user_id.slice(0, 8)}
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
                    <div className="flex justify-end gap-2">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              run(
                                order.id,
                                verifyOrder,
                                "Payment confirmed — course enrolled",
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