import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactMessages, type ContactMessage } from "@/components/admin/contact-messages";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
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
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Contact Messages</h1>
      <p className="wp-subtitle">
        Messages submitted from the contact form. Manage status, reply and
        follow up with visitors.
      </p>
      <div className="mt-6">
        <ContactMessages messages={messages} />
      </div>
    </div>
  );
}