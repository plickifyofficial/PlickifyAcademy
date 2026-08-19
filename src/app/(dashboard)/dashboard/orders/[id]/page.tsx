import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Order" };

const statusMeta = (status: string) =>
  status === "paid"
    ? { cls: "bg-green-100 text-green-700", label: "Paid" }
    : status === "failed"
      ? { cls: "bg-red-100 text-red-700", label: "Failed" }
      : { cls: "bg-amber-100 text-amber-700", label: "Under Review" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, amount, status, payment_method, trx_id, coupon_id, created_at, course_id, product_id, courses(title, slug, cover_image), products(name, slug, cover_image, gradient)",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const course = order.courses as unknown as {
    title: string;
    slug: string;
    cover_image: string | null;
  } | null;
  const product = order.products as unknown as {
    name: string;
    slug: string;
    cover_image: string | null;
    gradient: string | null;
  } | null;
  const isProduct = Boolean(product);
  const meta = statusMeta(order.status);
  const itemName = isProduct ? product?.name ?? "Product" : course?.title ?? "Course";
  const itemLink = isProduct
    ? `/digital-products/${product?.slug ?? ""}`
    : `/courses/${course?.slug ?? ""}`;
  const cover = isProduct ? product?.cover_image : course?.cover_image;
  const gradient = product?.gradient ?? "linear-gradient(135deg,#4f46e5,#7c3aed)";
  const orderNumber = `PLK-${order.id.slice(0, 8).toUpperCase()}`;
  const total = Number(order.amount);
  const discounted = order.coupon_id ? total * 1.15 : null;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/orders" className="hover:text-brand-600">
          My Orders
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="truncate font-medium text-zinc-900">{orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Invoice</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Order {orderNumber} ·{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <i className="fa-solid fa-print" /> Print / PDF
          </button>
          <a
            href={itemLink}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {isProduct ? "View Product" : "View Course"}
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 bg-zinc-900 px-6 py-5 text-white print:bg-zinc-900">
          <div>
            <p className="text-base font-extrabold">PLICKIFY ACADEMY</p>
            <p className="text-[11px] text-zinc-300">Payment Receipt / Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{orderNumber}</p>
            <p className="text-[11px] text-zinc-300">
              {new Date(order.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Billed To
              </p>
              <p className="mt-1 font-semibold text-zinc-900">
                {profile?.full_name || "Customer"}
              </p>
              <p className="text-sm text-zinc-500">{profile?.email}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Status
              </p>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>
                {meta.label}
              </span>
              <p className="mt-1 text-xs text-zinc-400">
                Payment:{" "}
                <span className="capitalize">
                  {order.payment_method === "nagad" ? "Nagad" : order.payment_method ?? "—"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-xl border border-zinc-200 p-4">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={itemName}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-xl font-black text-white"
                style={{ background: gradient }}
              >
                {itemName.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-zinc-900">{itemName}</p>
              <p className="text-xs text-zinc-500">
                {isProduct ? "Digital Product" : "Online Course"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-900">
                ৳{total.toLocaleString("en-IN")}
              </p>
              {order.trx_id && (
                <p className="text-[11px] text-zinc-400">
                  TrxID: <span className="font-mono">{order.trx_id}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-dashed border-zinc-200 pt-4 text-sm">
            <div className="space-y-1 text-zinc-500">
              {discounted != null && (
                <p className="flex justify-between gap-8">
                  <span>Subtotal</span>
                  <span>৳{discounted.toLocaleString("en-IN")}</span>
                </p>
              )}
              {order.coupon_id && (
                <p className="flex justify-between gap-8">
                  <span>Coupon discount</span>
                  <span className="text-green-600">
                    -৳{(discounted! - total).toLocaleString("en-IN")}
                  </span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Total Paid
              </p>
              <p className="text-2xl font-extrabold text-zinc-900">
                ৳{total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-zinc-400">
            Thank you for choosing Plickify Academy. For questions about this
            order, contact support from your dashboard Messages.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}