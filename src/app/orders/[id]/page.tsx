import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);

  const { data: order } = await supabase
    .from("orders")
    .select("*, courses(title, slug, cover_image), products(name, slug, cover_image, gradient, delivery_type, invite_link)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle() as unknown as { data: {
      id: string; amount: number; status: string; payment_method: string | null; trx_id: string | null;
      course_id: string | null; product_id: string | null; variant_id?: string | null; admin_note?: string | null;
      created_at: string;
      courses: { title: string; slug: string; cover_image: string | null } | null;
      products: { name: string; slug: string; cover_image: string | null; gradient: string | null; delivery_type?: string; invite_link?: string | null } | null;
    } | null };

  if (!order) notFound();

  const isProduct = !!order.product_id;
  const delivery = (order.products as { delivery_type?: string } | null)?.delivery_type || "download";
  const isCourse = !!order.course_id;
  const itemName = isProduct ? order.products?.name ?? "Digital Product" : order.courses?.title ?? "Course";
  const itemLink = isProduct ? `/digital-products/${order.products?.slug ?? ""}` : `/courses/${order.courses?.slug ?? ""}`;
  const cover = isProduct ? order.products?.cover_image : order.courses?.cover_image;
  const paid = order.status === "paid";
  const pending = order.status === "pending";
  const failed = order.status === "failed";

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${paid ? "bg-green-100 text-green-600" : pending ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
          <i className={`fa-solid ${paid ? "fa-check" : pending ? "fa-clock" : "fa-xmark"} text-2xl`} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 sm:text-3xl">
          {paid ? "Order Confirmed!" : pending ? "Order Under Review" : "Order Failed"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Order <span className="font-mono font-semibold text-zinc-900">PLK-{order.id.slice(0, 8).toUpperCase()}</span> · {new Date(order.created_at).toLocaleString("en-US")}
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-6">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={itemName} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-indigo-600 text-xl font-bold text-white">{itemName.charAt(0)}</span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-zinc-900">{itemName}</p>
            <p className="text-xs text-zinc-500">{isProduct ? `Digital Product · ${delivery}` : "Online Course"}</p>
            {(order as { variant_id?: string }).variant_id && <p className="text-xs text-brand-600">Variant: {(order as { variant_id?: string }).variant_id}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold text-zinc-900">{formatPrice(Number(order.amount))}</p>
            <p className="text-xs capitalize text-zinc-500">{order.payment_method ?? "—"}</p>
          </div>
        </div>

        {(order as { admin_note?: string }).admin_note && (
          <div className="mx-6 rounded-xl bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Admin Note</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">{(order as { admin_note?: string }).admin_note}</p>
          </div>
        )}

        <div className="p-6">
          {isCourse && (
            <div className="rounded-xl bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-900">Course Access</h3>
              <p className="mt-1 text-sm text-zinc-600">
                {paid ? "Your course is unlocked! Go to your dashboard to start learning." : pending ? "Your payment is being verified (5–30 min). Course will unlock automatically." : "Payment failed. Please try again or contact support."}
              </p>
              <div className="mt-4 flex gap-3">
                <Link href="/dashboard" className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">Go to Dashboard</Link>
                <Link href={itemLink} className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-semibold">View Course</Link>
              </div>
            </div>
          )}

          {isProduct && delivery === "download" && (
            <div className="rounded-xl bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-900">Download</h3>
              <p className="mt-1 text-sm text-zinc-600">
                {paid ? "Your product is ready to download." : pending ? "Download will unlock after verification." : "Payment failed."}
              </p>
              {paid ? (
                <a href={`/api/download/${order.product_id}?order=${order.id}`} className="mt-4 inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">Download Now</a>
              ) : (
                <p className="mt-2 text-xs text-zinc-500">You’ll receive access in My Digital Products after approval.</p>
              )}
              <Link href="/dashboard/my-products" className="ml-3 text-sm font-semibold text-brand-600">My Products</Link>
            </div>
          )}

          {isProduct && delivery === "invitation" && (
            <div className="rounded-xl bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">Invitation Access</h3>
              <p className="mt-1 text-sm text-blue-700">
                {paid ? "Your invitation is ready." : "Invitation will be sent after verification."}
              </p>
              {paid && (order.products as { invite_link?: string } | null)?.invite_link ? (
                <a href={(order.products as { invite_link?: string }).invite_link!} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white">Open Invite Link</a>
              ) : (
                <p className="mt-2 text-xs text-blue-600">Admin will provide your invite link after confirmation.</p>
              )}
            </div>
          )}

          {isProduct && delivery === "access" && (
            <div className="rounded-xl bg-zinc-900 p-4 text-white">
              <h3 className="font-semibold">Mail/Pass Access</h3>
              <p className="mt-1 text-sm text-zinc-300">
                {paid ? "Your access details are below." : "Access details will appear here after verification."}
              </p>
              {(order as { admin_note?: string }).admin_note ? (
                <div className="mt-3 rounded-lg bg-white/10 p-3 font-mono text-sm whitespace-pre-wrap">{(order as { admin_note?: string }).admin_note}</div>
              ) : (
                <p className="mt-2 text-xs text-zinc-400">Admin will add your credentials/note after confirming — check this page again.</p>
              )}
              <Link href="/dashboard/orders" className="mt-4 inline-block text-sm font-semibold text-brand-300">View All Orders</Link>
            </div>
          )}

          {order.trx_id && (
            <p className="mt-4 text-xs text-zinc-400">TrxID: <span className="font-mono">{order.trx_id}</span></p>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href={isProduct ? "/digital-products" : "/courses"} className="text-sm font-semibold text-brand-600">Continue Shopping</Link>
      </div>
    </main>
  );
}