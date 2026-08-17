import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "Student";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1">
      <DashboardSidebar
        name={name}
        email={user.email ?? ""}
        isAdmin={profile?.role === "admin"}
      />
      <div className="min-w-0 flex-1 p-4 pt-16 md:pt-8 md:pl-8">
        {children}
      </div>
    </main>
  );
}