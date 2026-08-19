import { createClient } from "@/lib/supabase/server";

export type StudentCourse = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image: string | null;
  instructor: string;
  totalLessons: number;
  doneLessons: number;
  percent: number;
  completed: boolean;
  notStarted: boolean;
  lastLessonId: string | null;
  lastLessonTitle: string | null;
  lastSectionTitle: string | null;
  lastActivity: string | null;
  totalMinutes: number;
  enrolledAt: string;
};

export type ContinueLearning = {
  course: StudentCourse;
  lessonId: string | null;
  lessonTitle: string | null;
  sectionTitle: string | null;
  moduleIndex: number | null;
};

export type StudentStats = {
  enrolled: number;
  completed: number;
  learningHours: string;
  certificates: number;
};

export type LiveClassItem = {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_url: string | null;
  course: { id: string; title: string; slug: string; cover_image: string | null } | null;
  instructor: string;
};

export type ActivityItem = {
  id: string;
  type: "lesson" | "quiz" | "order" | "product" | "certificate";
  title: string;
  detail: string;
  at: string;
  link: string;
};

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatHours(minutes: number): string {
  if (minutes <= 0) return "0h";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export async function getEnrolledCourses(
  userId: string,
): Promise<StudentCourse[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      "id, created_at, course_id, courses(id, title, subtitle, slug, cover_image, created_by)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = ((enrollments ?? []) as unknown as Array<{
    created_at: string;
    course_id: string;
    courses: {
      id: string;
      title: string;
      subtitle: string | null;
      slug: string;
      cover_image: string | null;
      created_by: string | null;
    } | null;
  }>).filter((e) => Boolean(e.courses));

  const courseIds = rows.map((r) => r.course_id);
  if (courseIds.length === 0) return [];

  const creatorIds = Array.from(
    new Set(
      rows
        .map((r) => r.courses?.created_by)
        .filter((v): v is string => Boolean(v)),
    ),
  );

  const [{ data: lessons }, { data: progress }, { data: state }, { data: creators }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("id, course_id, duration_minutes, section_id, title")
        .in("course_id", courseIds),
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", userId),
      supabase
        .from("user_course_state")
        .select("course_id, last_lesson_id, updated_at")
        .eq("user_id", userId),
      creatorIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", creatorIds)
        : Promise.resolve({ data: [] }),
    ]);

  const nameMap: Record<string, string> = {};
  for (const c of creators ?? []) {
    nameMap[c.id] = c.full_name || "Instructor";
  }

  const progressMap = new Map(
    (progress ?? []).map((p) => [
      p.lesson_id,
      p.completed_at as string | null,
    ]),
  );
  const stateMap = new Map(
    (state ?? []).map((s) => [s.course_id, s] as const),
  );
  const lessonMap = new Map(
    (lessons ?? []).map((l) => [l.id, l] as const),
  );

  const courses: StudentCourse[] = [];

  for (const row of rows) {
    const course = row.courses!;
    const courseLessons = (lessons ?? []).filter(
      (l) => l.course_id === course.id && l.section_id,
    );
    const total = courseLessons.length;
    const done = courseLessons.filter((l) => progressMap.has(l.id)).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    const st = stateMap.get(course.id);
    let lastActivity: string | null = null;
    for (const l of courseLessons) {
      const at = progressMap.get(l.id);
      if (at && (!lastActivity || at > lastActivity)) lastActivity = at;
    }
    if (st?.updated_at && (!lastActivity || st.updated_at > lastActivity)) {
      lastActivity = st.updated_at;
    }

    const lastLesson =
      (st?.last_lesson_id && lessonMap.get(st.last_lesson_id)) || null;

    courses.push({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      slug: course.slug,
      cover_image: course.cover_image,
      instructor: nameMap[course.created_by ?? ""] || "Instructor",
      totalLessons: total,
      doneLessons: done,
      percent,
      completed: total > 0 && done >= total,
      notStarted: done === 0,
      lastLessonId: lastLesson?.id ?? null,
      lastLessonTitle: lastLesson?.title ?? null,
      lastSectionTitle: null,
      lastActivity,
      totalMinutes: courseLessons.reduce(
        (s, l) => s + (l.duration_minutes || 0),
        0,
      ),
      enrolledAt: row.created_at,
    });
  }

  return courses;
}

export async function getStudentStats(
  userId: string,
  courses: StudentCourse[],
): Promise<StudentStats> {
  const supabase = await createClient();
  const completed = courses.filter((c) => c.completed).length;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons(duration_minutes)")
    .eq("user_id", userId);

  let learnedMinutes = 0;
  for (const p of progress ?? []) {
    const l = p.lessons as unknown as { duration_minutes: number } | null;
    learnedMinutes += l?.duration_minutes || 0;
  }

  const { count } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    enrolled: courses.length,
    completed,
    learningHours: formatHours(learnedMinutes),
    certificates: count ?? 0,
  };
}

export async function getUpcomingLiveClasses(
  userId: string,
  courseIds: string[],
): Promise<LiveClassItem[]> {
  if (courseIds.length === 0) return [];
  const supabase = await createClient();

  const { data: rowsRaw } = await supabase
    .from("live_classes")
    .select(
      "id, title, description, scheduled_at, duration_minutes, meeting_url, course_id, courses(id, title, slug, cover_image, created_by)",
    )
    .in("course_id", courseIds)
    .order("scheduled_at", { ascending: true })
    .limit(20);

  const rows = (rowsRaw ?? []) as unknown as Array<{
    id: string;
    title: string;
    description: string | null;
    scheduled_at: string | null;
    duration_minutes: number;
    meeting_url: string | null;
    course_id: string;
    courses: {
      id: string;
      title: string;
      slug: string;
      cover_image: string | null;
      created_by: string | null;
    } | null;
  }>;

  const creatorIds = Array.from(
    new Set(
      rows
        .map((r) => r.courses?.created_by)
        .filter((v): v is string => Boolean(v)),
    ),
  );

  const { data: creators } =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [] };

  const nameMap: Record<string, string> = {};
  for (const c of creators ?? []) nameMap[c.id] = c.full_name || "Instructor";

  const now = new Date();
  const upcoming = rows
    .filter((r) => r.scheduled_at && new Date(r.scheduled_at) >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at as string).getTime() -
        new Date(b.scheduled_at as string).getTime(),
    );

  return upcoming.slice(0, 3).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    scheduled_at: r.scheduled_at,
    duration_minutes: r.duration_minutes,
    meeting_url: r.meeting_url,
    course: r.courses,
    instructor: nameMap[r.courses?.created_by ?? ""] || "Instructor",
  }));
}

export async function getRecentActivity(
  userId: string,
  courseIds: string[],
): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const items: ActivityItem[] = [];

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at, lessons(id, title, course_id)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(6);

  for (const p of progress ?? []) {
    const l = p.lessons as unknown as {
      id: string;
      title: string;
      course_id: string;
    } | null;
    if (!l) continue;
    items.push({
      id: `lesson-${p.lesson_id}`,
      type: "lesson",
      title: l.title,
      detail: "Lesson completed",
      at: p.completed_at,
      link: `/dashboard/learn/${l.course_id}/${l.id}`,
    });
  }

  const { data: purchases } = await supabase
    .from("product_purchases")
    .select("id, created_at, products(id, name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  for (const p of purchases ?? []) {
    const prod = p.products as unknown as { id: string; name: string } | null;
    if (!prod) continue;
    items.push({
      id: `product-${p.id}`,
      type: "product",
      title: prod.name,
      detail: "Digital product purchased",
      at: p.created_at,
      link: "/dashboard/my-products",
    });
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, amount, status, courses(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  for (const o of orders ?? []) {
    const c = o.courses as unknown as { title: string } | null;
    items.push({
      id: `order-${o.id}`,
      type: "order",
      title: c?.title ?? "Course order",
      detail: `Order ${o.status} · ৳${o.amount}`,
      at: o.created_at,
      link: "/dashboard/orders",
    });
  }

  void courseIds;
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
}

export async function getRecommendedCourses(
  userId: string,
  enrolledIds: string[],
): Promise<
  {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    cover_image: string | null;
    price: number;
    original_price: number;
    level: string;
  }[]
> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("id, title, subtitle, slug, cover_image, price, original_price, level")
    .eq("is_published", true)
    .eq("visibility", "public");

  if (enrolledIds.length > 0) query = query.not("id", "in", `(${enrolledIds.join(",")})`);

  const { data } = await query.order("is_featured", { ascending: false }).limit(3);
  return (data ?? []) as unknown as Awaited<
    ReturnType<typeof getRecommendedCourses>
  >;
}

export async function getContinueLearning(
  courses: StudentCourse[],
): Promise<ContinueLearning | null> {
  if (courses.length === 0) return null;

  const target =
    courses.find((c) => !c.completed && !c.notStarted) ??
    courses.find((c) => !c.completed) ??
    courses[0];

  let moduleIndex: number | null = null;
  let sectionTitle: string | null = null;
  if (target.lastLessonId) {
    const supabase = await createClient();
    const { data: lesson } = await supabase
      .from("lessons")
      .select("title, section_id, course_sections(title, position)")
      .eq("id", target.lastLessonId)
      .maybeSingle();
    if (lesson) {
      target.lastLessonTitle = lesson.title;
      const sec = lesson.course_sections as unknown as {
        title: string;
        position: number;
      } | null;
      if (sec) {
        sectionTitle = sec.title;
        moduleIndex = sec.position;
      }
    }
  }

  return {
    course: target,
    lessonId: target.lastLessonId ?? null,
    lessonTitle: target.lastLessonTitle,
    sectionTitle,
    moduleIndex,
  };
}

export async function getAllLiveClasses(
  userId: string,
  courseIds: string[],
): Promise<{ upcoming: LiveClassItem[]; past: LiveClassItem[] }> {
  if (courseIds.length === 0) return { upcoming: [], past: [] };
  const supabase = await createClient();

  const { data: rowsRaw } = await supabase
    .from("live_classes")
    .select(
      "id, title, description, scheduled_at, duration_minutes, meeting_url, course_id, courses(id, title, slug, cover_image, created_by)",
    )
    .in("course_id", courseIds)
    .order("scheduled_at", { ascending: true })
    .limit(200);

  const rows = (rowsRaw ?? []) as unknown as Array<{
    id: string;
    title: string;
    description: string | null;
    scheduled_at: string | null;
    duration_minutes: number;
    meeting_url: string | null;
    course_id: string;
    courses: {
      id: string;
      title: string;
      slug: string;
      cover_image: string | null;
      created_by: string | null;
    } | null;
  }>;

  const creatorIds = Array.from(
    new Set(
      rows
        .map((r) => r.courses?.created_by)
        .filter((v): v is string => Boolean(v)),
    ),
  );

  const { data: creators } =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [] };

  const nameMap: Record<string, string> = {};
  for (const c of creators ?? []) nameMap[c.id] = c.full_name || "Instructor";

  const map = (r: (typeof rows)[number]): LiveClassItem => ({
    id: r.id,
    title: r.title,
    description: r.description,
    scheduled_at: r.scheduled_at,
    duration_minutes: r.duration_minutes,
    meeting_url: r.meeting_url,
    course: r.courses,
    instructor: nameMap[r.courses?.created_by ?? ""] || "Instructor",
  });

  const now = new Date();
  const upcoming = rows
    .filter((r) => r.scheduled_at && new Date(r.scheduled_at) >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at as string).getTime() -
        new Date(b.scheduled_at as string).getTime(),
    )
    .map(map);
  const past = rows
    .filter(
      (r) => r.scheduled_at && new Date(r.scheduled_at) < now,
    )
    .sort(
      (a, b) =>
        new Date(b.scheduled_at as string).getTime() -
        new Date(a.scheduled_at as string).getTime(),
    )
    .map(map);

  void userId;
  return { upcoming, past };
}

export type QuizListItem = {
  id: string;
  title: string;
  course: { id: string; title: string; slug: string; cover_image: string | null };
  passPercent: number;
  totalQuestions: number;
  attempts: number;
  bestScore: number | null;
  passed: boolean;
  lastAttemptAt: string | null;
};

export async function getQuizList(userId: string): Promise<QuizListItem[]> {
  const supabase = await createClient();

  const { data: enrolledRaw } = await supabase
    .from("enrollments")
    .select("course_id, courses(id, title, slug, cover_image)")
    .eq("user_id", userId);
  const enrolled = (enrolledRaw ?? []) as unknown as Array<{
    course_id: string;
    courses: {
      id: string;
      title: string;
      slug: string;
      cover_image: string | null;
    } | null;
  }>;
  const courseIds = enrolled
    .map((e) => e.courses?.id)
    .filter((v): v is string => Boolean(v));
  if (courseIds.length === 0) return [];

  const [{ data: quizLessons }, { data: attempts }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, pass_percent, section_id, course_id")
      .eq("type", "quiz")
      .in("course_id", courseIds),
    supabase
      .from("quiz_attempts")
      .select("lesson_id, score, total, passed, created_at")
      .eq("user_id", userId),
  ]);

  const courseMap = new Map(enrolled.map((e) => [e.course_id, e.courses]));
  const attemptMap = new Map<string, { score: number; passed: boolean; at: string }[]>();
  for (const a of attempts ?? []) {
    const arr = attemptMap.get(a.lesson_id) ?? [];
    arr.push({ score: a.score, passed: a.passed, at: a.created_at });
    attemptMap.set(a.lesson_id, arr);
  }

  const items: QuizListItem[] = [];
  for (const q of quizLessons ?? []) {
    const course = courseMap.get(q.course_id);
    if (!course) continue;
    const attemptsList = attemptMap.get(q.id) ?? [];
    const best = attemptsList.length
      ? Math.max(...attemptsList.map((a) => a.score))
      : null;
    const passed = attemptsList.some((a) => a.passed);
    items.push({
      id: q.id,
      title: q.title,
      course: { id: course.id, title: course.title, slug: course.slug, cover_image: course.cover_image },
      passPercent: q.pass_percent ?? 60,
      totalQuestions: 0,
      attempts: attemptsList.length,
      bestScore: best,
      passed,
      lastAttemptAt: attemptsList.length
        ? attemptsList.map((a) => a.at).sort().at(-1) ?? null
        : null,
    });
  }

  const { data: counts } = await supabase
    .from("quiz_questions")
    .select("lesson_id, id")
    .in(
      "lesson_id",
      items.map((i) => i.id),
    );
  const countMap = new Map<string, number>();
  for (const c of counts ?? []) countMap.set(c.lesson_id, (countMap.get(c.lesson_id) ?? 0) + 1);
  for (const i of items) i.totalQuestions = countMap.get(i.id) ?? 0;

  return items;
}

export type AssignmentListItem = {
  id: string;
  title: string;
  course: { id: string; title: string; slug: string; cover_image: string | null };
  dueDate: string | null;
  totalPoints: number;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  graded: boolean;
};

export async function getAssignmentList(
  userId: string,
): Promise<AssignmentListItem[]> {
  const supabase = await createClient();

  const { data: enrolledRaw } = await supabase
    .from("enrollments")
    .select("course_id, courses(id, title, slug, cover_image)")
    .eq("user_id", userId);
  const enrolled = (enrolledRaw ?? []) as unknown as Array<{
    course_id: string;
    courses: {
      id: string;
      title: string;
      slug: string;
      cover_image: string | null;
    } | null;
  }>;
  const courseIds = enrolled
    .map((e) => e.courses?.id)
    .filter((v): v is string => Boolean(v));
  if (courseIds.length === 0) return [];

  const { data: assignmentLessons } = await supabase
    .from("lessons")
    .select("id, title, course_id")
    .eq("type", "assignment")
    .in("course_id", courseIds);

  const lessonIds = (assignmentLessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return [];

  const [{ data: assignments }, { data: submissions }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, lesson_id, due_date, total_points")
      .in("lesson_id", lessonIds),
    supabase
      .from("assignment_submissions")
      .select("lesson_id, submitted_at, grade, feedback")
      .eq("user_id", userId),
  ]);

  const courseMap = new Map(enrolled.map((e) => [e.course_id, e.courses]));
  const assignmentMap = new Map((assignments ?? []).map((a) => [a.lesson_id, a]));
  const submissionMap = new Map(
    (submissions ?? []).map((s) => [s.lesson_id, s] as const),
  );

  const items: AssignmentListItem[] = [];
  for (const l of assignmentLessons ?? []) {
    const course = courseMap.get(l.course_id);
    if (!course) continue;
    const assignment = assignmentMap.get(l.id);
    const sub = submissionMap.get(l.id);
    items.push({
      id: l.id,
      title: l.title,
      course: { id: course.id, title: course.title, slug: course.slug, cover_image: course.cover_image },
      dueDate: assignment?.due_date ?? null,
      totalPoints: assignment?.total_points ?? 100,
      submittedAt: sub?.submitted_at ?? null,
      grade: sub?.grade ?? null,
      feedback: sub?.feedback ?? null,
      graded: sub?.grade != null,
    });
  }

  return items;
}

export type CertificateItem = {
  id: string;
  certificate_number: string;
  issued_at: string;
  course: { id: string; title: string; slug: string } | null;
};

export async function getCertificatesList(userId: string): Promise<CertificateItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, courses(id, title, slug)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  return ((data ?? []) as unknown as Array<{
    id: string;
    certificate_number: string;
    issued_at: string;
    courses: { id: string; title: string; slug: string } | null;
  }>).map((c) => ({
    id: c.id,
    certificate_number: c.certificate_number,
    issued_at: c.issued_at,
    course: c.courses,
  }));
}