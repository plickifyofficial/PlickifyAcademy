import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, amount, status, payment_method, trx_id, created_at, courses(title, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const statusMeta = (status: string) =>
    status === "paid"
      ? { cls: "bg-green-100 text-green-700", label: "Paid" }
      : status === "failed"
        ? { cls: "bg-red-100 text-red-700", label: "Failed" }
        : { cls: "bg-amber-100 text-amber-700", label: "Under Review" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">My Orders</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Check your payment status here
      </p>

      {(orders ?? []).length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <p className="text-zinc-600">You have no orders yet.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {(orders ?? []).map((order) => {
            const course = order.courses as unknown as {
              title: string;
              slug: string;
            } | null;
            const meta = statusMeta(order.status);
            return (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <Link
                    href={`/courses/${course?.slug ?? ""}`}
                    className="font-semibold text-zinc-900 hover:text-brand-700"
                  >
                    {course?.title ?? "Course"}
                  </Link>
                  {order.payment_method && (
                    <p className="mt-1 text-sm text-zinc-500">
                      <span className="capitalize">
                        {order.payment_method === "nagad" ? "Nagad" : "bKash"}
                      </span>
                      {order.trx_id && (
                        <span className="ml-1 font-mono text-xs">
                          · TrxID: {order.trx_id}
                        </span>
                      )}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-zinc-900">
                    ৳{Number(order.amount).toLocaleString("en-IN")}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}

          <p className="rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
            <i className="fa-solid fa-circle-info mr-1" />
            "Under Review" means your payment is being verified by an admin. Once verified,
            your course will be enrolled automatically and you will receive a notification.
          </p>
        </div>
      )}
    </div>
  );
}