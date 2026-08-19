import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestimonialsTable } from "@/components/admin/testimonials-table";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
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
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(500);

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Testimonials</h1>
      <p className="wp-subtitle">
        Student reviews shown on the homepage and other sections. Published
        testimonials appear on the site instantly.
      </p>
      <div className="mt-6">
        <TestimonialsTable items={(data ?? []) as never} />
      </div>
    </div>
  );
}
