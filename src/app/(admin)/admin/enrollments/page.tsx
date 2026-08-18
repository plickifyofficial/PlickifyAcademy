import { createClient } from "@/lib/supabase/server";
import { EnrollmentsPanel } from "@/components/admin/enrollments-panel";

export const metadata = { title: "Enrollments" };

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase.from("courses").select("id, title").order("title", { ascending: true }),
    supabase
      .from("enrollments")
      .select("id, created_at, user_id, course_id, profiles(email), courses(title)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div>
        <h1 className="wp-page-title">Enrollments</h1>
        <p className="wp-subtitle">Manually enroll/unenroll students in courses</p>
      </div>
      <EnrollmentsPanel
        courses={courses ?? []}
        enrollments={
          (enrollments ?? []) as unknown as {
            id: string;
            created_at: string;
            user_id: string;
            course_id: string;
            profiles: { email: string } | null;
            courses: { title: string } | null;
          }[]
        }
      />
    </div>
  );
}