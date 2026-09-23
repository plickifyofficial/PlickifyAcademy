import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentShell } from "@/components/dashboard/student-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user) redirect("/login");

  // sites.bd flow: no server DB — shell gets data client-side (instant)
  const name = user.user_metadata?.full_name || "Student";
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
  const siteName = "Plickify Academy";

  return (
    <StudentShell
      name={name}
      email={user.email ?? ""}
      avatarUrl={avatarUrl}
      role={(user.user_metadata?.role as string) ?? "student"}
      siteName={siteName}
      logoUrl={null}
    >
      {children}
    </StudentShell>
  );
}