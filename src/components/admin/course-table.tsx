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
import {
  FieldRenderer,
  getPath,
  setPath,
  type Path,
} from "@/components/admin/content-editor";
import {
  coursePageDefaults,
  courseContentFields,
} from "@/lib/content-schema";
import { uploadContentImage } from "@/lib/actions/content";

function Field({
  name,
  label,
  defaultValue,
  required,
  type = "text",
  placeholder,
  inputMode,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel";
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="wp-label">{label}</label>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
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

function CourseContentFields({ course }: { course?: Course }) {
  const { showToast } = useToast();
  const [value, setValue] = useState<Record<string, unknown>>(() => {
    const defaults = coursePageDefaults as unknown as Record<string, unknown>;
    const stored =
      course?.content && typeof course.content === "object"
        ? (course.content as Record<string, unknown>)
        : {};
    return { ...defaults, ...stored };
  });

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    path: Path,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await uploadContentImage(fd);
      setValue((v) => setPath(v, path as string[], res.url));
      showToast("Image uploaded");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Image upload failed",
        "error",
      );
    }
  }

  return (
    <div className="space-y-5">
      <input
        type="hidden"
        name="course_content"
        value={JSON.stringify(value)}
      />
      <p className="rounded bg-[#f0f6fc] px-3 py-2 text-xs text-[#2271b1]">
        Customize the course page content for this course only. Leave unchanged
        to use the global "Course Detail Page" defaults.
      </p>
      {courseContentFields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={getPath(value, [field.key])}
          sectionKey="course-content"
          onChange={(path, v) =>
            setValue((prev) =>
              setPath(prev, [field.key, ...path] as string[], v),
            )
          }
          onImageUpload={(path, e) =>
            handleImageUpload(e, [field.key, ...path])
          }
        />
      ))}
    </div>
  );
}

function CourseFormFields({ course }: { course?: Course }) {
  return (
    <div className="space-y-3">
      <Group title="Basic Info" icon="fa-solid fa-circle-info">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field name="title" label="Title" required defaultValue={course?.title} />
          <Field name="slug" label="Slug" required defaultValue={course?.slug} placeholder="my-course" />
          <Field name="subtitle" label="Subtitle / Tagline" defaultValue={course?.subtitle ?? ""} placeholder="e.g., AI & Digital Income Mastery" />
          <Field name="category" label="Category" defaultValue={course?.category ?? "General"} placeholder="e.g., AI, Freelancing" />
        </div>
        <TextArea name="description" label="Detailed Description" defaultValue={course?.description ?? ""} rows={6} className="mt-3" />
        <p className="mt-1 text-xs text-[#646970]">
          <i className="fa-solid fa-circle-info mr-1" />
          Markdown supported — headings (# / ##), bullets (*), bold (**text**), emoji. It will display nicely on the course page.
        </p>
      </Group>

      <Group title="Price & Discount" icon="fa-solid fa-tags">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field name="price" label="Current Price (৳)" type="text" inputMode="decimal" defaultValue={course?.price ?? 0} placeholder="e.g., 3500" />
          <Field name="original_price" label="Previous Price (৳) — to show a crossed-out price" type="text" inputMode="decimal" defaultValue={course?.original_price ?? 0} placeholder="e.g., 7000" />
        </div>
        <p className="mt-2 text-xs text-[#646970]">
          <i className="fa-solid fa-circle-info mr-1" />
          If the previous price is 0, no discount will be shown. Example: current 3,500, previous 7,000.
        </p>
      </Group>

      <Group title="Cover Image" icon="fa-solid fa-image">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="wp-label">Upload Image</label>
            <input
              type="file"
              name="cover_image_file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="wp-input file:mr-2 file:rounded file:border-0 file:bg-[#f0f6fc] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#2271b1]"
            />
          </div>
          <Field name="cover_image" label="Or Image URL" defaultValue={course?.cover_image ?? ""} placeholder="https://..." />
        </div>
        {course?.cover_image && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.cover_image}
              alt="Current cover"
              className="h-14 w-24 rounded object-cover"
            />
            <span className="text-xs text-[#646970]">Current cover — will be replaced if a new image is uploaded</span>
          </div>
        )}
      </Group>

      <Group title="Promo Video" icon="fa-solid fa-video">
        <VideoSourceFields
          prefix="promo_video"
          initialUrl={course?.promo_video_url ?? ""}
          initialEmbed={course?.promo_video_embed ?? ""}
        />
      </Group>

      <Group title="Classification & Language" icon="fa-solid fa-layer-group">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="wp-label">Level</label>
            <select name="level" defaultValue={course?.level ?? "beginner"} className="wp-input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Field name="language" label="Language" defaultValue={course?.language ?? "Bengali"} placeholder="e.g., Bengali, English" />
          <Field name="tags" label="Tags (comma separated)" defaultValue={course?.tags?.join(", ") ?? ""} placeholder="e.g., AI, Freelancing, Live" />
        </div>
      </Group>

      <Group title="Settings" icon="fa-solid fa-gear">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-[#3c434a]">
            <input type="checkbox" name="is_published" defaultChecked={course?.is_published ?? false} className="h-4 w-4" />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#3c434a]">
            <input type="checkbox" name="is_featured" defaultChecked={course?.is_featured ?? false} className="h-4 w-4" />
            Featured (will be shown on home page)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#3c434a]">
            <input type="hidden" name="certificate" value="off" />
            <input type="checkbox" name="certificate" value="on" defaultChecked={course?.certificate ?? true} className="h-4 w-4" />
            Will provide certificate
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#3c434a]">Visibility</label>
            <select name="visibility" defaultValue={course?.visibility ?? "public"} className="wp-input !w-auto !py-1.5">
              <option value="public">Public (shown everywhere)</option>
              <option value="private">Private (shown only via link)</option>
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#646970]">
          <i className="fa-solid fa-circle-info mr-1" />
          Private: not shown on course list/home page, but accessible directly via course link (e.g., /courses/ai-income-mastery).
        </p>
      </Group>

      <Group title="Course Page Content" icon="fa-solid fa-file-lines">
        <CourseContentFields course={course} />
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
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setPending(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await run(async () => {
      await createCourse(new FormData(form));
      form.reset();
      setCreating(false);
    }, "Course created");
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await run(async () => {
      await updateCourse(new FormData(form));
      setEditingId(null);
    }, "Course updated");
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Delete "${course.title}"?`)) return;
    const fd = new FormData();
    fd.set("id", course.id);
    await run(() => deleteCourse(fd), "Course deleted");
  }

  return (
    <div className="space-y-4">
      {creating && (
        <form onSubmit={handleCreate} className="wp-panel">
          <div className="wp-panel-header">
            Create New Course
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs font-medium text-[#646970] hover:text-[#b32d2e]"
            >
              Cancel ✕
            </button>
          </div>
          <div className="wp-panel-body space-y-4">
            <CourseFormFields />
            <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
              <i className="fa-solid fa-plus" /> {pending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="wp-panel">
        <div className="wp-panel-header">
          All Courses
          <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
            {courses.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="wp-table min-w-[640px]">
            <thead>
              <tr>
                <th>Course</th>
                <th>Price</th>
                <th>Level</th>
                <th>Status</th>
                <th>Topics</th>
                <th className="text-right">Actions</th>
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
                          <span className="wp-tag">Featured</span>
                        )}
                        {course.visibility === "private" && (
                          <span className="wp-tag wp-tag-amber">Private</span>
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
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          setOpenCurriculum(openCurriculum === course.id ? null : course.id)
                        }
                        className="text-xs font-medium text-[#2271b1] hover:text-[#135e96] hover:underline"
                      >
                        {topicCount(course.id)} Topics ▾
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
                          <i className="fa-solid fa-pen" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
                          disabled={pending}
                          className="wp-btn wp-btn-danger"
                        >
                          <i className="fa-solid fa-trash" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {editingId === course.id && (
                    <tr key={`${course.id}-edit`}>
                      <td colSpan={6} className="bg-[#f6f7f7] px-4 py-4">
                        <form onSubmit={handleUpdate} className="wp-panel">
                          <div className="wp-panel-header">Edit Course</div>
                          <div className="wp-panel-body">
                            <input type="hidden" name="id" value={course.id} />
                            <CourseFormFields course={course} />
                            <div className="mt-4 flex gap-2">
                              <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
                                <i className="fa-solid fa-floppy-disk" /> {pending ? "Updating..." : "Update"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="wp-btn"
                              >
                                Cancel
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
                    No courses. Click new course to get started.
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