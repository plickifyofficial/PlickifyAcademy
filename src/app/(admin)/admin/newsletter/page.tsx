import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewsletterTable } from "@/components/admin/newsletter-table";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
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
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Newsletter</h1>
      <p className="wp-subtitle">
        Emails collected from the footer newsletter form. Toggle a subscriber to
        unsubscribed to stop including them, or delete them entirely.
      </p>
      <div className="mt-6">
        <NewsletterTable items={(data ?? []) as never} />
      </div>
    </div>
  );
}