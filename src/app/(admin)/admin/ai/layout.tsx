import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AiAdminTabs } from "@/components/admin/ai-admin-tabs";

export const dynamic = "force-dynamic";

export default async function AiAdminLayout({
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
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">AI Assistant</h1>
      <p className="wp-subtitle">
        Configure the site-wide AI agent — its knowledge base, behaviour and
        monitoring.
      </p>

      <AiAdminTabs />

      <div className="mt-6">{children}</div>
    </div>
  );
}
