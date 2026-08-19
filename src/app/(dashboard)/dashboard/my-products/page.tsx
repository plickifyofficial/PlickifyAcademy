import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { signDownloadToken } from "@/lib/product-access";

export const metadata = { title: "My Digital Products" };

export default async function MyProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: purchases } = await supabase
    .from("product_purchases")
    .select("id, price, created_at, products(id, name, slug, cover_image, gradient, file_format, file_size)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (purchases ?? []).map((p) => {
    const product = p.products as unknown as {
      id: string;
      name: string;
      slug: string;
      cover_image: string | null;
      gradient: string | null;
      file_format: string | null;
      file_size: string | null;
    } | null;
    const token = product ? signDownloadToken(product.id) : "";
    return {
      ...p,
      product,
      downloadUrl: product ? `/api/download/${product.id}?t=${token}` : null,
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
                    {p.downloadUrl ? (
                      <a
                        href={p.downloadUrl}
                        download
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        <i className="fa-solid fa-download" /> Download
                      </a>
                    ) : (
                      <span className="flex flex-1 items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-500">
                        File pending
                      </span>
                    )}
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