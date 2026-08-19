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
  subtitle: string | null;
  category: string | null;
  language: string | null;
  original_price: number;
  is_featured: boolean;
  certificate: boolean;
  tags: string[];
  visibility: "public" | "private";
  promo_video_url: string | null;
  promo_video_embed: string | null;
  cover_image: string | null;
  price: number;
  level: "beginner" | "intermediate" | "advanced" | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  content: Record<string, unknown> | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number;
  tag: string | null;
  category: string | null;
  product_type: string | null;
  tags: string[] | null;
  icon: string | null;
  gradient: string | null;
  cover_image: string | null;
  file_url: string | null;
  file_format: string | null;
  file_size: string | null;
  file_count: number | null;
  rating_avg: number | null;
  review_count: number | null;
  download_count: number | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  section_id: string | null;
  type: "lesson" | "quiz" | "assignment" | "video";
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  video_embed: string | null;
  content: string | null;
  duration_minutes: number;
  is_free: boolean;
  order: number;
  pass_percent: number;
  release_days: number;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  position: number;
};

export type QuizAttempt = {
  id: string;
  lesson_id: string;
  user_id: string;
  score: number;
  total: number;
  passed: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type QnaItem = {
  id: string;
  course_id: string;
  user_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  course_id: string;
  title: string;
  body: string | null;
  created_at: string;
};

export type Certificate = {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
};

export type WishlistItem = {
  course_id: string;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  value: number;
  course_id: string | null;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type LiveClass = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_url: string | null;
  created_at: string;
};

export type CourseSection = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
};

export type Category = {
  id: string;
  type: "course" | "product";
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  page: "homepage" | "courses" | "products" | "about" | "contact" | "global";
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  course: string | null;
  quote: string;
  rating: number;
  initials: string | null;
  color: string | null;
  avatar: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
};
