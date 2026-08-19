import { createClient } from "@/lib/supabase/server";
import {
  AssignmentsManager,
  type AdminAssignment,
} from "@/components/admin/assignments-manager";

export const metadata = { title: "Assignments" };

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  const isInstructor = profile?.role === "instructor";

  let coursesQuery = supabase
    .from("courses")
    .select("id, title");
  if (isInstructor && user) coursesQuery = coursesQuery.eq("created_by", user.id);
  const { data: courses } = await coursesQuery;

  const courseIds = (courses ?? []).map((c) => c.id);
  const scopedLessons =
    courseIds.length > 0
      ? await supabase
          .from("lessons")
          .select("id, title, course_id")
          .eq("type", "assignment")
          .in("course_id", courseIds)
      : { data: [] };

  const lessonIds = (scopedLessons.data ?? []).map((l) => l.id);

  const [{ data: assignments }, { data: submissions }] =
    lessonIds.length > 0
      ? await Promise.all([
          supabase
            .from("assignments")
            .select("lesson_id, due_date, total_points, instructions")
            .in("lesson_id", lessonIds),
          supabase
            .from("assignment_submissions")
            .select(
              "id, lesson_id, submission_text, submitted_at, grade, feedback, profiles(full_name)",
            )
            .in("lesson_id", lessonIds)
            .order("submitted_at", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];

  const courseMap = new Map((courses ?? []).map((c) => [c.id, c.title]));
  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [a.lesson_id, a] as const),
  );
  const submissionsMap = new Map<string, NonNullable<typeof submissions>[0][]>();
  for (const s of submissions ?? []) {
    const arr = submissionsMap.get(s.lesson_id) ?? [];
    arr.push(s);
    submissionsMap.set(s.lesson_id, arr);
  }

  const list: AdminAssignment[] = (scopedLessons.data ?? []).map((l) => {
    const meta = assignmentMap.get(l.id);
    const subs = (submissionsMap.get(l.id) ?? []).map((s) => {
      const p = s.profiles as unknown as { full_name: string | null } | null;
      return {
        id: s.id,
        student: p?.full_name || "Student",
        text: s.submission_text,
        submittedAt: s.submitted_at,
        grade: s.grade,
        feedback: s.feedback,
      };
    });
    return {
      lessonId: l.id,
      lessonTitle: l.title,
      courseId: l.course_id,
      courseTitle: courseMap.get(l.course_id) ?? "Course",
      dueDate: meta?.due_date ?? null,
      totalPoints: meta?.total_points ?? 100,
      instructions: meta?.instructions ?? null,
      submissions: subs,
    };
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">Assignments</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage assignment details and grade student submissions.
      </p>
      <div className="mt-5">
        <AssignmentsManager assignments={list} />
      </div>
    </div>
  );
}