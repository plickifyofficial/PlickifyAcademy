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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  const isInstructor = profile?.role === "instructor";

  let coursesQuery = supabase.from("courses").select("*");
  if (isInstructor && user) coursesQuery = coursesQuery.eq("created_by", user.id);
  const { data: courses } = await coursesQuery.order("created_at", {
    ascending: false,
  });

  const courseIds = (courses ?? []).map((c) => c.id);

  let sectionsQuery = supabase.from("course_sections").select("*");
  if (courseIds.length > 0) sectionsQuery = sectionsQuery.in("course_id", courseIds);
  const { data: sections } = await sectionsQuery.order("position", {
    ascending: true,
  });

  let topicsQuery = supabase.from("lessons").select("*");
  if (courseIds.length > 0) topicsQuery = topicsQuery.in("course_id", courseIds);
  const { data: topics } = await topicsQuery;

  let questionsQuery = supabase.from("quiz_questions").select("*");
  if (courseIds.length > 0) questionsQuery = questionsQuery.in("course_id", courseIds);
  const { data: questions } = await questionsQuery.order("position", {
    ascending: true,
  });

  let announcementsQuery = supabase.from("course_announcements").select("*");
  if (courseIds.length > 0)
    announcementsQuery = announcementsQuery.in("course_id", courseIds);
  const { data: announcements } = await announcementsQuery.order("created_at", {
    ascending: false,
  });

  let liveClassesQuery = supabase.from("live_classes").select("*");
  if (courseIds.length > 0)
    liveClassesQuery = liveClassesQuery.in("course_id", courseIds);
  const { data: liveClasses } = await liveClassesQuery.order("scheduled_at", {
    ascending: true,
  });

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

  const announcementsByCourse: Record<string, NonNullable<typeof announcements>[0][]> = {};
  for (const a of announcements ?? []) {
    if (announcementsByCourse[a.course_id]) {
      announcementsByCourse[a.course_id].push(a);
    } else {
      announcementsByCourse[a.course_id] = [a];
    }
  }

  const liveClassesByCourse: Record<string, NonNullable<typeof liveClasses>[0][]> = {};
  for (const lc of liveClasses ?? []) {
    if (liveClassesByCourse[lc.course_id]) {
      liveClassesByCourse[lc.course_id].push(lc);
    } else {
      liveClassesByCourse[lc.course_id] = [lc];
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
        announcementsByCourse={announcementsByCourse}
        liveClassesByCourse={liveClassesByCourse}
        defaultCreating={add === "1"}
      />
    </div>
  );
}
