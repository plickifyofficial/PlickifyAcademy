import { createClient } from "@/lib/supabase/server";
import { ProductsTable } from "@/components/admin/products-table";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div>
        <h1 className="wp-page-title">Digital Products</h1>
        <p className="wp-subtitle">
          Add and customize the digital products shown on your site
        </p>
      </div>
      <div className="mt-4">
        <ProductsTable products={products ?? []} />
      </div>
    </div>
  );
}