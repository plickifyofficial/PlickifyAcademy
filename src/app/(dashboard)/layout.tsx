import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/dashboard/student-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_name, logo_url")
    .eq("id", 1)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "Student";
  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "";
  const siteName = settings?.site_name || "Plickify Academy";

  return (
    <StudentShell
      name={name}
      email={user.email ?? ""}
      avatarUrl={avatarUrl}
      role={profile?.role ?? "student"}
      siteName={siteName}
      logoUrl={settings?.logo_url ?? null}
    >
      {children}
    </StudentShell>
  );
}