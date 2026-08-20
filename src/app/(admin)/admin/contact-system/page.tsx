import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getContactSettings } from "@/lib/contact-settings";
import { ContactSystemPanel } from "@/components/admin/contact/contact-system-panel";

export const dynamic = "force-dynamic";

export default async function AdminContactSystemPage() {
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

  const settings = await getContactSettings();
  const admin = createAdminClient();

  const [eventsRes, messagesRes] = await Promise.all([
    admin
      .from("contact_events")
      .select("event_type, label, path, created_at")
      .order("created_at", { ascending: false })
      .limit(300),
    admin
      .from("contact_messages")
      .select("*")
      .eq("subject", "Live Chat Offline")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const counts = new Map<string, number>();
  for (const e of (eventsRes.data ?? []) as { event_type: string }[]) {
    counts.set(e.event_type, (counts.get(e.event_type) ?? 0) + 1);
  }
  const eventCounts = Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <div className="max-w-6xl">
      <h1 className="wp-page-title">Contact System</h1>
      <p className="wp-subtitle">
        Floating contact button, WhatsApp, Messenger, live chat bot, business
        hours, placement and analytics — all controlled from here.
      </p>
      <div className="mt-6">
        <ContactSystemPanel
          settings={settings}
          eventCounts={eventCounts}
          recentEvents={
            (eventsRes.data ?? []) as {
              event_type: string;
              label: string | null;
              path: string | null;
              created_at: string;
            }[]
          }
          messages={
            (messagesRes.data ?? []) as {
              id: string;
              name: string | null;
              email: string | null;
              message: string;
              status: string;
              is_read: boolean;
              created_at: string;
            }[]
          }
        />
      </div>
    </div>
  );
}