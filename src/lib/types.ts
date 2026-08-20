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
  file_url?: string | null;
  has_file?: boolean;
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

export type Order = {
  id: string;
  user_id: string;
  course_id: string | null;
  product_id: string | null;
  stripe_session_id: string | null;
  amount: number;
  status: "pending" | "paid" | "failed";
  payment_method: string | null;
  trx_id: string | null;
  coupon_id: string | null;
  created_at: string;
};

export type ProductPurchase = {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  price: number;
  created_at: string;
  products?: Product | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  author_name: string | null;
  author_role: string | null;
  author_id: string | null;
  category_id: string | null;
  tags: string[] | null;
  reading_time: string | null;
  is_featured: boolean;
  is_popular: boolean;
  is_trending: boolean;
  is_editors_pick: boolean;
  is_published: boolean;
  status: "draft" | "published" | "scheduled";
  scheduled_at: string | null;
  published_at: string | null;
  view_count: number | null;
  seo_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  noindex: boolean;
  related_course_id: string | null;
  related_product_ids: string[];
  created_at: string;
  updated_at: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  seo_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type BlogAuthor = {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  bio: string | null;
  role: string | null;
  expertise: string[] | null;
  socials: Record<string, string> | null;
  created_at: string;
};

export type BlogComment = {
  id: string;
  post_id: string;
  user_id: string | null;
  parent_id: string | null;
  name: string | null;
  email: string | null;
  body: string;
  status: "pending" | "approved" | "rejected" | "spam";
  is_reported: boolean;
  report_count: number;
  likes: number;
  created_at: string;
};

export type BlogRevision = {
  id: string;
  post_id: string;
  title: string | null;
  excerpt: string | null;
  body: string | null;
  created_by: string | null;
  created_at: string;
};

export type BlogSettings = {
  postsPerPage: number;
  defaultCategoryId: string | null;
  defaultAuthorId: string | null;
  commentsEnabled: boolean;
  commentsModeration: "auto" | "manual";
  shareButtons: boolean;
  relatedPosts: boolean;
  showReadingTime: boolean;
  showViewCounter: boolean;
  showNewsletter: boolean;
  showSidebar: boolean;
  showFeatured: boolean;
  pagination: "paged" | "load-more";
  seoTitleTemplate: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string | null;
  created_at: string;
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

export type LessonResource = {
  id: string;
  lesson_id: string;
  title: string;
  file_path: string;
  file_type: string | null;
  file_size: string | null;
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

export type Batch = {
  id: string;
  course_id: string | null;
  title: string;
  description: string;
  start_date: string | null;
  duration: string;
  schedule: string;
  class_count: number;
  seats_total: number;
  seats_filled: number;
  price: number;
  old_price: number;
  status: "open" | "upcoming" | "ongoing" | "closed";
  is_featured: boolean;
  is_published: boolean;
  meeting_info: string;
  features: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Instructor = {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  photo: string | null;
  initials: string;
  color: string;
  expertise: string[];
  facebook: string;
  youtube: string;
  linkedin: string;
  instagram: string;
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
