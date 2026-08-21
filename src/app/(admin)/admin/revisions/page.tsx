import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RevisionsManager } from "@/components/admin/revisions-manager";
import { allSections } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

export default async function AdminRevisionsPage() {
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

  const admin = createAdminClient();
  const { data: revisions } = await admin
    .from("site_content_revisions")
    .select("id, key, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const labels: Record<string, string> = Object.fromEntries(
    allSections.map((s) => [s.key, s.title]),
  );

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Revision History</h1>
      <p className="wp-subtitle">
        Every content save keeps a snapshot of the previous version. Restore
        any older version with one click (last 20 per section).
      </p>

      <div className="mt-6">
        <RevisionsManager
          initialRevisions={(revisions ?? []).map((r) => ({
            id: r.id,
            key: r.key,
            createdAt: r.created_at,
            label: labels[r.key] ?? r.key,
          }))}
        />
      </div>
    </div>
  );
}
