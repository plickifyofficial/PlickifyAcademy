import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { signDownloadToken } from "@/lib/product-access";

export const metadata = { title: "My Digital Products" };

export default async function MyProductsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) redirect("/login");

  const { data: purchases } = await supabase
    .from("product_purchases")
    .select("id, price, created_at, order_id, products(id, name, slug, cover_image, gradient, file_format, file_size, delivery_type, invite_link)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const orderIds = (purchases ?? []).map((p) => (p as { order_id?: string | null }).order_id).filter(Boolean) as string[];
  let orderNotes: Record<string, string> = {};
  if (orderIds.length > 0) {
    const { data: orders } = await supabase.from("orders").select("id, admin_note").in("id", orderIds);
    for (const o of orders ?? []) {
      if ((o as { admin_note?: string | null }).admin_note) orderNotes[o.id] = (o as { admin_note: string }).admin_note;
    }
  }

  const items = (purchases ?? []).map((p) => {
    const product = p.products as unknown as {
      id: string;
      name: string;
      slug: string;
      cover_image: string | null;
      gradient: string | null;
      file_format: string | null;
      file_size: string | null;
      delivery_type?: string | null;
      invite_link?: string | null;
    } | null;
    const delivery = (product as { delivery_type?: string } | null)?.delivery_type || "download";
    const token = product ? signDownloadToken(product.id) : "";
    const isAccess = delivery === "access";
    const isInvitation = delivery === "invitation";
    return {
      ...p,
      product,
      delivery,
      isAccess,
      isInvitation,
      downloadUrl: product && delivery === "download" ? `/api/download/${product.id}?t=${token}` : null,
      inviteUrl: product && isInvitation ? (product.invite_link || null) : null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">My Digital Products</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Your purchased resources — download anytime, lifetime access
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <p className="text-zinc-600">You have no digital products yet.</p>
          <Link
            href="/digital-products"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => {
            const product = p.product;
            if (!product) return null;
            return (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Link
                  href={`/digital-products/${product.slug}`}
                  className={`flex aspect-[16/9] items-center justify-center bg-gradient-to-br ${
                    product.gradient || "from-blue-600 to-indigo-600"
                  }`}
                >
                  {product.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.cover_image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <i className="fa-solid fa-file-lines text-5xl text-white/85" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold leading-snug text-zinc-900">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    {product.file_format && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium">
                        {product.file_format}
                      </span>
                    )}
                    {product.file_size && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium">
                        {product.file_size}
                      </span>
                    )}
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">
                    Purchased{" "}
                    {new Date(p.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-4 flex flex-1 items-end gap-2">
                    {p.isAccess ? (
                      (() => {
                        const oid = (p as { order_id?: string | null }).order_id;
                        const note = oid ? orderNotes[oid] : null;
                        return (
                          <Link
                            href={oid ? `/orders/${oid}` : `/dashboard/orders`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"
                            title={note || "View access details"}
                          >
                            <i className="fa-solid fa-eye" /> View Detail
                          </Link>
                        );
                      })()
                    ) : p.isInvitation ? (
                      p.inviteUrl ? (
                        <a
                          href={p.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                        >
                          <i className="fa-solid fa-link" /> Access
                        </a>
                      ) : (
                        <span className="flex flex-1 items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-500">
                          Invite pending
                        </span>
                      )
                    ) : p.downloadUrl ? (
                      <a
                        href={p.downloadUrl}
                        download
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        <i className="fa-solid fa-download" /> Download
                      </a>
                    ) : (
                      <span className="flex flex-1 items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-500">
                        File pending
                      </span>
                    )}
                    <Link
                      href={`/digital-products/${product.slug}`}
                      className="flex items-center justify-center rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}