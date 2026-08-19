import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { ProductCheckoutPanel } from "@/components/checkout/product-checkout-panel";

export const metadata = { title: "Checkout" };

export default async function ProductCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const settings = await getSiteSettings();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, name, slug, description, price, old_price, cover_image, gradient, file_count, file_format, file_size")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!product) notFound();

  const { data: owned } = await admin
    .from("product_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .maybeSingle();
  if (owned) redirect("/dashboard/my-products");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="transition-colors hover:text-brand-600">
          Home
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <Link
          href={`/digital-products/${product.slug}`}
          className="truncate transition-colors hover:text-brand-600"
        >
          {product.name}
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="font-medium text-zinc-900">Checkout</span>
      </nav>

      <h1 className="mt-6 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">Order Summary</h2>
            <div className="mt-4 flex items-start gap-4">
              <div
                className={`relative flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${
                  product.gradient || "from-blue-600 to-indigo-600"
                } text-2xl font-bold text-white`}
              >
                {product.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.cover_image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  product.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-snug text-zinc-900">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {product.description}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  <i className="fa-solid fa-bolt mr-1 text-brand-600" />
                  Instant download after verification
                  <span className="mx-2 text-zinc-300">·</span>
                  <i className="fa-solid fa-infinity mr-1 text-brand-600" />
                  Lifetime access
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-zinc-100 pt-4">
              <div>
                {product.old_price > product.price && (
                  <span className="mr-2 text-sm text-zinc-400 line-through">
                    {formatPrice(product.old_price)}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-zinc-900">
                  {formatPrice(product.price)}
                </span>
                {product.price <= 0 && (
                  <span className="ml-2 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Free
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900">
              {product.price > 0 ? "Payment Details" : "Get the Product"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {product.price > 0
                ? "Send the amount via bKash or Nagad, then submit your TrxID below."
                : "This product is free — unlock it with one click."}
            </p>
            <div className="mt-4">
              <ProductCheckoutPanel
                productId={product.id}
                price={Number(product.price)}
                bkashNumber={settings?.bkash_number ?? ""}
                nagadNumber={settings?.nagad_number ?? ""}
              />
            </div>
            <p className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-500">
              <i className="fa-solid fa-shield-halved text-green-600" />
              Secure Payment · Instant Download · Lifetime Access
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}