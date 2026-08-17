export type Profile = {
  id: string;
  full_name: string | null;
  role: "student" | "admin";
  avatar_url: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  price: number;
  level: "beginner" | "intermediate" | "advanced" | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  content: string | null;
  duration_minutes: number;
  is_free: boolean;
  order: number;
  created_at: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
};
