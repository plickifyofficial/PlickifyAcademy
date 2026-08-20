import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCourseTable } from "@/components/admin/course-table";

export const metadata = { title: "Courses" };

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
  const scoped = (
    table:
      | "course_sections"
      | "lessons"
      | "quiz_questions"
      | "course_announcements"
      | "live_classes"
      | "lesson_resources",
  ) => {
    const q = supabase.from(table).select("*");
    return courseIds.length > 0 ? q.in("course_id", courseIds) : q;
  };

  const [
    { data: sections },
    { data: topics },
    { data: questions },
    { data: announcements },
    { data: liveClasses },
    { data: resources },
  ] = await Promise.all([
    scoped("course_sections").order("position", { ascending: true }),
    scoped("lessons"),
    scoped("quiz_questions").order("position", { ascending: true }),
    scoped("course_announcements").order("created_at", { ascending: false }),
    scoped("live_classes").order("scheduled_at", { ascending: true }),
    scoped("lesson_resources").order("created_at", { ascending: true }),
  ]);

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

  const resourcesByLesson: Record<string, NonNullable<typeof resources>[0][]> = {};
  for (const r of resources ?? []) {
    if (resourcesByLesson[r.lesson_id]) {
      resourcesByLesson[r.lesson_id].push(r);
    } else {
      resourcesByLesson[r.lesson_id] = [r];
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="wp-page-title">Courses</h1>
          <p className="wp-subtitle">Manage courses, sections, and topics</p>
        </div>
        <Link
          href="/admin/courses?add=1"
          className="wp-btn wp-btn-primary mb-5"
        >
          <i className="fa-solid fa-plus" /> New Course
        </Link>
      </div>
      <AdminCourseTable
        courses={courses ?? []}
        sectionsByCourse={sectionsByCourse}
        topicsBySection={topicsBySection}
        questionsByLesson={questionsByLesson}
        announcementsByCourse={announcementsByCourse}
        liveClassesByCourse={liveClassesByCourse}
        resourcesByLesson={resourcesByLesson}
        defaultCreating={add === "1"}
      />
    </div>
  );
}
