import { createClient } from "@/lib/supabase/server";
import { EnrollmentsPanel } from "@/components/admin/enrollments-panel";

export const metadata = { title: "এনরোলমেন্ট" };

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "id, created_at, user_id, course_id, profiles(email), courses(title)",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div>
        <h1 className="wp-page-title">এনরোলমেন্ট</h1>
        <p className="wp-subtitle">ছাত্রদের ম্যানুয়ালি কোর্সে এনরোল / আনএনরোল করুন</p>
      </div>
      <EnrollmentsPanel
        courses={courses ?? []}
        enrollments={
          enrollments as unknown as {
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