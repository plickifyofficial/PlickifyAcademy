import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FaqsTable } from "@/components/admin/faqs-table";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
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
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1000);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">FAQs</h1>
      <p className="wp-subtitle">
        Frequently asked questions for each page. Assign an FAQ to a page and
        publish it to show it on the site.
      </p>
      <div className="mt-6">
        <FaqsTable items={(data ?? []) as never} />
      </div>
    </div>
  );
}
