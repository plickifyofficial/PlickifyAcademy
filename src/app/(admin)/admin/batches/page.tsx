import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BatchesTable } from "@/components/admin/batches-table";

export const dynamic = "force-dynamic";

export default async function AdminBatchesPage() {
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

  const [{ data: batches }, { data: courses }] = await Promise.all([
    supabase
      .from("batches")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(500),
    supabase.from("courses").select("id, title").order("title", { ascending: true }),
  ]);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Live Batches</h1>
      <p className="wp-subtitle">
        Manage live batches with seats, schedule and pricing. Published batches
        appear on the Live Batch page.
      </p>
      <div className="mt-6">
        <BatchesTable
          items={(batches ?? []) as never}
          courses={(courses ?? []).map((c) => ({ id: c.id, title: c.title }))}
        />
      </div>
    </div>
  );
}