import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstructorsTable } from "@/components/admin/instructors-table";

export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
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
    .from("instructors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(500);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Instructors</h1>
      <p className="wp-subtitle">
        Manage instructors and mentors. Published instructors appear on the
        About page.
      </p>
      <div className="mt-6">
        <InstructorsTable items={(data ?? []) as never} />
      </div>
    </div>
  );
}