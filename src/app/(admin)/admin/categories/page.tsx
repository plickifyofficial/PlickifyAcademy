import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoriesTable } from "@/components/admin/categories-table";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(500);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Categories</h1>
      <p className="wp-subtitle">
        Manage course and product categories. Categories show up in the course
        and digital product marketplaces.
      </p>
      <div className="mt-6">
        <CategoriesTable items={(data ?? []) as never} />
      </div>
    </div>
  );
}
