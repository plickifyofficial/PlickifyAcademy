"use client";

import { Fragment, useState } from "react";
import type { Course, CourseSection, Lesson } from "@/lib/types";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/actions/admin";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/toaster";
import { CurriculumBuilder } from "@/components/admin/curriculum-builder";

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

export function AdminCourseTable({
  courses,
  sectionsByCourse,
  topicsBySection,
  defaultCreating = false,
}: {
  courses: Course[];
  sectionsByCourse: Record<string, CourseSection[]>;
  topicsBySection: Record<string, Lesson[]>;
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
    await run(() => deleteCourse(courseToFormData(course)), "কোর্স মুছে ফেলা হয়েছে");
  }

  function courseToFormData(course: Course) {
    const fd = new FormData();
    fd.set("id", course.id);
    return fd;
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field name="title" label="শিরোনাম" required />
              <Field name="slug" label="Slug" required placeholder="my-course" />
              <Field name="price" label="দাম (৳)" type="number" defaultValue={0} />
              <div>
                <label className="wp-label">কভার ইমেজ</label>
                <input
                  type="file"
                  name="cover_image_file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="wp-input file:mr-2 file:rounded file:border-0 file:bg-[#f0f6fc] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#2271b1]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field name="cover_image" label="অথবা ইমেজ URL" placeholder="https://..." />
              <div>
                <label className="wp-label">বর্ণনা</label>
                <textarea
                  name="description"
                  rows={2}
                  className="wp-input"
                />
              </div>
              <div>
                <label className="wp-label">লেভেল</label>
                <select name="level" className="wp-input">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm font-medium text-[#3c434a]">
                <input type="checkbox" name="is_published" className="h-4 w-4" />
                পাবলিশ
              </label>
            </div>
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
                      </div>
                    </td>
                    <td className="font-medium">{formatPrice(course.price)}</td>
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
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <Field name="title" label="শিরোনাম" defaultValue={course.title} required />
                              <Field name="slug" label="Slug" defaultValue={course.slug} required />
                              <Field name="price" label="দাম (৳)" type="number" defaultValue={course.price} />
                              <div>
                                <label className="wp-label">নতুন কভার (আপলোড)</label>
                                <input
                                  type="file"
                                  name="cover_image_file"
                                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                  className="wp-input file:mr-2 file:rounded file:border-0 file:bg-[#f0f6fc] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#2271b1]"
                                />
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <Field name="cover_image" label="অথবা ইমেজ URL" defaultValue={course.cover_image ?? ""} />
                              <div className="sm:col-span-2">
                                <label className="wp-label">বর্ণনা</label>
                                <textarea
                                  name="description"
                                  rows={2}
                                  defaultValue={course.description ?? ""}
                                  className="wp-input"
                                />
                              </div>
                              <div>
                                <label className="wp-label">লেভেল</label>
                                <select
                                  name="level"
                                  defaultValue={course.level ?? "beginner"}
                                  className="wp-input"
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                </select>
                              </div>
                            </div>
                            <label className="mt-3 flex items-center gap-2 text-sm font-medium text-[#3c434a]">
                              <input
                                type="checkbox"
                                name="is_published"
                                defaultChecked={course.is_published}
                                className="h-4 w-4"
                              />
                              পাবলিশ
                            </label>
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