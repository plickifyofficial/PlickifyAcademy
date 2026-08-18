import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { StudentsTable } from "@/components/admin/students-table";

export const metadata = { title: "Students" };

export default async function AdminStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  const emails: Record<string, string> = {};
  const admin = createAdminClient();
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of authUsers?.users ?? []) {
    emails[u.id] = u.email ?? "";
  }

  const rows = (profiles ?? []).map((p) => ({
    ...p,
    email: emails[p.id] ?? "",
  }));

  return (
    <div>
      <h1 className="wp-page-title">Students</h1>
      <p className="wp-subtitle">All users and their roles</p>
      <StudentsTable students={rows} currentUserId={user.id} />
    </div>
  );
}