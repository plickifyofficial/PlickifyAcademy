import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EnrollmentsPanel } from "@/components/admin/enrollments-panel";

export const metadata = { title: "Enrollments" };

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase.from("courses").select("id, title").order("title", { ascending: true }),
    supabase
      .from("enrollments")
      .select("id, created_at, user_id, course_id, courses(title)")
      .order("created_at", { ascending: false }),
  ]);

  const emails: Record<string, string> = {};
  const admin = createAdminClient();
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of authUsers?.users ?? []) {
    emails[u.id] = u.email ?? "";
  }

  return (
    <div>
      <div>
        <h1 className="wp-page-title">Enrollments</h1>
        <p className="wp-subtitle">Manually enroll/unenroll students in courses</p>
      </div>
      <EnrollmentsPanel
        courses={courses ?? []}
        emails={emails}
        enrollments={
          (enrollments ?? []) as unknown as {
            id: string;
            created_at: string;
            user_id: string;
            course_id: string;
            courses: { title: string } | null;
          }[]
        }
      />
    </div>
  );
}