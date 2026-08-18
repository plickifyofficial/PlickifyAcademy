"use client";

import { Fragment, useState } from "react";
import type {
  Course,
  CourseSection,
  Lesson,
  QuizQuestion,
  Announcement,
  LiveClass,
} from "@/lib/types";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/actions/admin";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/toaster";
import { CurriculumBuilder } from "@/components/admin/curriculum-builder";
import { VideoSourceFields } from "@/components/admin/video-source-fields";

function Field({
  name,
  label,
  defaultValue,
  required,
  type = "text",
  placeholder,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="wp-label">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        className="wp-input"
      />
    </div>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
  rows = 3,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="wp-label">{label}</label>
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="wp-input" />
    </div>
  );
}

function Group({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#dcdcde] bg-[#f6f7f7] p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#2271b1]">
        <i className={`${icon} text-sm`} />
        {title}
      </p>
      {children}
    </div>
  );
}

function CourseFormFields({ course }: { course?: Course }) {
  return (
    <div className="space-y-3">
      <Group title="মৌলিক তথ্য" icon="fa-solid fa-circle-info">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field name="title" label="শিরোনাম" required defaultValue={course?.title} />
          <Field name="slug" label="Slug" required defaultValue={course?.slug} placeholder="my-course" />
          <Field name="subtitle" label="সাব-টাইটেল / ট্যাগলাইন" defaultValue={course?.subtitle ?? ""} placeholder="যেমন: AI & Digital Income Mastery" />
          <Field name="category" label="ক্যাটাগরি" defaultValue={course?.category ?? "General"} placeholder="যেমন: AI, Freelancing" />
        </div>
        <TextArea name="description" label="বিস্তারিত বর্ণনা" defaultValue={course?.description ?? ""} rows={4} className="mt-3" />
      </Group>

      <Group title="মূল্য ও ডিসকাউন্ট" icon="fa-solid fa-tags">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field name="price" label="বর্তমান দাম (৳)" type="number" defaultValue={course?.price ?? 0} />
          <Field name="original_price" label="আগের দাম (৳) — কাটা দাম দেখাতে" type="number" defaultValue={course?.original_price ?? 0} />
        </div>
        <p className="mt-2 text-xs text-[#646970]">
          <i className="fa-solid fa-circle-info mr-1" />
          আগের দাম 0 রাখলে ডিসকাউন্ট দেখাবে না। উদাহরণ: বর্তমান ৩,৫০০, আগের ৭,০০০।
        </p>
      </Group>

      <Group title="কভার ইমেজ" icon="fa-solid fa-image">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="wp-label">ছবি আপলোড করুন</label>
            <input
              type="file"
              name="cover_image_file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="wp-input file:mr-2 file:rounded file:border-0 file:bg-[#f0f6fc] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#2271b1]"
            />
          </div>
          <Field name="cover_image" label="অথবা ইমেজ URL" defaultValue={course?.cover_image ?? ""} placeholder="https://..." />
        </div>
        {course?.cover_image && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.cover_image}
              alt="বর্তমান কভার"
              className="h-14 w-24 rounded object-cover"
            />
            <span className="text-xs text-[#646970]">বর্তমান কভার — নতুন ছবি দিলে প্রতিস্থাপিত হবে</span>
          </div>
        )}
      </Group>

      <Group title="প্রোমো ভিডিও" icon="fa-solid fa-video">
        <VideoSourceFields
          prefix="promo_video"
          initialUrl={course?.promo_video_url ?? ""}
          initialEmbed={course?.promo_video_embed ?? ""}
        />
      </Group>

      <Group title="শ্রেণীবিভাগ ও ভাষা" icon="fa-solid fa-layer-group">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="wp-label">লেভেল</label>
            <select name="level" defaultValue={course?.level ?? "beginner"} className="wp-input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Field name="language" label="ভাষা" defaultValue={course?.language ?? "Bengali"} placeholder="যেমন: Bengali, English" />
          <Field name="tags" label="ট্যাগ (কমা দিয়ে আলাদা)" defaultValue={course?.tags?.join(", ") ?? ""} placeholder="যেমন: AI, Freelancing, Live" />
        </div>
      </Group>

      <Group title="সেটিংস" icon="fa-solid fa-gear">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-[#3c434a]">
            <input type="checkbox" name="is_published" defaultChecked={course?.is_published ?? false} className="h-4 w-4" />
            পাবলিশ
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#3c434a]">
            <input type="checkbox" name="is_featured" defaultChecked={course?.is_featured ?? false} className="h-4 w-4" />
            ফিচার্ড (হোমে দেখানো হবে)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#3c434a]">
            <input type="hidden" name="certificate" value="off" />
            <input type="checkbox" name="certificate" value="on" defaultChecked={course?.certificate ?? true} className="h-4 w-4" />
            সার্টিফিকেট দেওয়া হবে
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#3c434a]">ভিজিবিলিটি</label>
            <select name="visibility" defaultValue={course?.visibility ?? "public"} className="wp-input !w-auto !py-1.5">
              <option value="public">পাবলিক (সব জায়গায় দেখাবে)</option>
              <option value="private">প্রাইভেট (শুধু লিংকে দেখাবে)</option>
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#646970]">
          <i className="fa-solid fa-circle-info mr-1" />
          প্রাইভেট: কোর্স তালিকা/হোম পেজে দেখাবে না, তবে সরাসরি কোর্স লিংকে (যেমন /courses/ai-income-mastery) খুলবে।
        </p>
      </Group>
    </div>
  );
}

export function AdminCourseTable({
  courses,
  sectionsByCourse,
  topicsBySection,
  questionsByLesson,
  announcementsByCourse,
  liveClassesByCourse,
  defaultCreating = false,
}: {
  courses: Course[];
  sectionsByCourse: Record<string, CourseSection[]>;
  topicsBySection: Record<string, Lesson[]>;
  questionsByLesson: Record<string, QuizQuestion[]>;
  announcementsByCourse: Record<string, Announcement[]>;
  liveClassesByCourse: Record<string, LiveClass[]>;
  defaultCreating?: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(defaultCreating);
  const [openCurriculum, setOpenCurriculum] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  function topicCount(courseId: string): number {
    const sections = sectionsByCourse[courseId] ?? [];
    return sections.reduce(
      (n, s) => n + (topicsBySection[s.id]?.length ?? 0),
      0,
    );
  }

  async function run(action: () => Promise<void>, success: string) {
    setPending(true);
    try {
      await action();
      showToast(success);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে", "error");
    } finally {
      setPending(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(async () => {
      await createCourse(new FormData(e.currentTarget));
      e.currentTarget.reset();
      setCreating(false);
    }, "কোর্স তৈরি হয়েছে");
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(async () => {
      await updateCourse(new FormData(e.currentTarget));
      setEditingId(null);
    }, "কোর্স আপডেট হয়েছে");
  }

  async function handleDelete(course: Course) {
    if (!confirm(`"${course.title}" মুছে ফেলবেন?`)) return;
    const fd = new FormData();
    fd.set("id", course.id);
    await run(() => deleteCourse(fd), "কোর্স মুছে ফেলা হয়েছে");
  }

  return (
    <div className="space-y-4">
      {creating && (
        <form onSubmit={handleCreate} className="wp-panel">
          <div className="wp-panel-header">
            নতুন কোর্স তৈরি করুন
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs font-medium text-[#646970] hover:text-[#b32d2e]"
            >
              বাতিল ✕
            </button>
          </div>
          <div className="wp-panel-body space-y-4">
            <CourseFormFields />
            <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
              <i className="fa-solid fa-plus" /> {pending ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
            </button>
          </div>
        </form>
      )}

      <div className="wp-panel">
        <div className="wp-panel-header">
          সব কোর্স
          <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
            {courses.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="wp-table min-w-[640px]">
            <thead>
              <tr>
                <th>কোর্স</th>
                <th>দাম</th>
                <th>লেভেল</th>
                <th>স্ট্যাটাস</th>
                <th>টপিক</th>
                <th className="text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <Fragment key={course.id}>
                  <tr>
                    <td>
                      <div className="flex items-center gap-3">
                        {course.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.cover_image}
                            alt={course.title}
                            className="h-10 w-14 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded bg-gradient-to-br from-[#2271b1] to-[#135e96] text-sm font-bold text-white">
                            {course.title.charAt(0)}
                          </span>
                        )}
                        <span className="font-semibold text-[#1d2327]">
                          {course.title}
                        </span>
                        {course.is_featured && (
                          <span className="wp-tag">ফিচার্ড</span>
                        )}
                        {course.visibility === "private" && (
                          <span className="wp-tag wp-tag-amber">প্রাইভেট</span>
                        )}
                      </div>
                    </td>
                    <td className="font-medium">
                      {formatPrice(course.price)}
                      {(course.original_price ?? 0) > course.price && (
                        <span className="ml-1 text-xs text-[#8c8f94] line-through">
                          {formatPrice(course.original_price)}
                        </span>
                      )}
                    </td>
                    <td className="capitalize text-[#646970]">{course.level}</td>
                    <td>
                      <span
                        className={`wp-tag ${
                          course.is_published ? "wp-tag-green" : "wp-tag-amber"
                        }`}
                      >
                        {course.is_published ? "পাবলিশড" : "ড্রাফট"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          setOpenCurriculum(openCurriculum === course.id ? null : course.id)
                        }
                        className="text-xs font-medium text-[#2271b1] hover:text-[#135e96] hover:underline"
                      >
                        {topicCount(course.id)} টপিক ▾
                      </button>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditingId(editingId === course.id ? null : course.id)
                          }
                          className="wp-btn"
                        >
                          <i className="fa-solid fa-pen" /> এডিট
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
                          disabled={pending}
                          className="wp-btn wp-btn-danger"
                        >
                          <i className="fa-solid fa-trash" /> মুছুন
                        </button>
                      </div>
                    </td>
                  </tr>

                  {editingId === course.id && (
                    <tr key={`${course.id}-edit`}>
                      <td colSpan={6} className="bg-[#f6f7f7] px-4 py-4">
                        <form onSubmit={handleUpdate} className="wp-panel">
                          <div className="wp-panel-header">কোর্স এডিট করুন</div>
                          <div className="wp-panel-body">
                            <input type="hidden" name="id" value={course.id} />
                            <CourseFormFields course={course} />
                            <div className="mt-4 flex gap-2">
                              <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
                                <i className="fa-solid fa-floppy-disk" /> {pending ? "আপডেট হচ্ছে..." : "আপডেট"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="wp-btn"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}

                  {openCurriculum === course.id && (
                    <tr key={`${course.id}-curriculum`}>
                      <td colSpan={6} className="bg-[#f6f7f7] px-4 py-4">
                        <CurriculumBuilder
                          course={course}
                          sections={sectionsByCourse[course.id] ?? []}
                          topics={topicsBySection}
                          questionsByLesson={questionsByLesson}
                          announcements={announcementsByCourse[course.id] ?? []}
                          liveClasses={liveClassesByCourse[course.id] ?? []}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#646970]">
                    কোনো কোর্স নেই। নতুন কোর্স চেপে শুরু করুন।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}