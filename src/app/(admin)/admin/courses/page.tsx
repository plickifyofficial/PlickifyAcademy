import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCourseTable } from "@/components/admin/course-table";

export const metadata = { title: "কোর্সসমূহ" };

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const { add } = await searchParams;
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: sections } = await supabase
    .from("course_sections")
    .select("*")
    .order("position", { ascending: true });

  const { data: topics } = await supabase.from("lessons").select("*");

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .order("position", { ascending: true });

  const sectionsByCourse: Record<string, NonNullable<typeof sections>[0][]> = {};
  for (const section of sections ?? []) {
    if (sectionsByCourse[section.course_id]) {
      sectionsByCourse[section.course_id].push(section);
    } else {
      sectionsByCourse[section.course_id] = [section];
    }
  }

  const topicsBySection: Record<string, NonNullable<typeof topics>[0][]> = {};
  for (const topic of topics ?? []) {
    if (topic.section_id) {
      if (topicsBySection[topic.section_id]) {
        topicsBySection[topic.section_id].push(topic);
      } else {
        topicsBySection[topic.section_id] = [topic];
      }
    }
  }

  const questionsByLesson: Record<string, NonNullable<typeof questions>[0][]> = {};
  for (const q of questions ?? []) {
    if (questionsByLesson[q.lesson_id]) {
      questionsByLesson[q.lesson_id].push(q);
    } else {
      questionsByLesson[q.lesson_id] = [q];
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="wp-page-title">কোর্সসমূহ</h1>
          <p className="wp-subtitle">কোর্স, সেকশন ও টপিক ম্যানেজ করুন</p>
        </div>
        <Link
          href="/admin/courses?add=1"
          className="wp-btn wp-btn-primary mb-5"
        >
          <i className="fa-solid fa-plus" /> নতুন কোর্স
        </Link>
      </div>
      <AdminCourseTable
        courses={courses ?? []}
        sectionsByCourse={sectionsByCourse}
        topicsBySection={topicsBySection}
        questionsByLesson={questionsByLesson}
        defaultCreating={add === "1"}
      />
    </div>
  );
}