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
      ? { cls: "wp-tag-green", label: "পেইড" }
      : status === "failed"
        ? { cls: "wp-tag-red", label: "ব্যর্থ" }
        : { cls: "wp-tag-amber", label: "পেন্ডিং" };

  return (
    <div className="overflow-x-auto">
      <table className="wp-table min-w-[860px]">
        <thead>
          <tr>
            <th>কোর্স</th>
            <th>স্টুডেন্ট</th>
            <th>মেথড / TrxID</th>
            <th>পরিমাণ</th>
            <th>স্ট্যাটাস</th>
            <th>তারিখ</th>
            <th className="text-right">অ্যাকশন</th>
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
                    {new Date(order.created_at).toLocaleDateString("bn-BD", {
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
                                "পেমেন্ট নিশ্চিত হয়েছে — এনরোল করা হয়েছে",
                              )
                            }
                            disabled={pending}
                            className="wp-btn wp-btn-primary"
                          >
                            <i className="fa-solid fa-check" />{" "}
                            {pending ? "..." : "ভেরিফাই"}
                          </button>
                          <button
                            onClick={() =>
                              run(order.id, rejectOrder, "অর্ডারটি ব্যর্থ করা হয়েছে")
                            }
                            disabled={pending}
                            className="wp-btn wp-btn-danger"
                          >
                            <i className="fa-solid fa-xmark" /> বাতিল
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
                এখনো কোনো অর্ডার নেই।
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}