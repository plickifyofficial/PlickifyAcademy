"use client";

import { Fragment, useState } from "react";
import type { Course, Lesson } from "@/lib/types";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  deleteLesson,
} from "@/lib/actions/admin";
import { formatPrice } from "@/lib/format";

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
      <label className="mb-1 block text-xs font-medium text-zinc-600">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}

export function AdminCourseTable({
  courses,
  lessonsByCourse,
}: {
  courses: Course[];
  lessonsByCourse: Record<string, Lesson[]>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [openLessons, setOpenLessons] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleDelete(course: Course) {
    if (!confirm(`"${course.title}" মুছে ফেলবেন?`)) return;
    setPending(true);
    const fd = new FormData();
    fd.set("id", course.id);
    await deleteCourse(fd);
    setPending(false);
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm("লেসন মুছে ফেলবেন?")) return;
    const fd = new FormData();
    fd.set("id", id);
    await deleteLesson(fd);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {creating ? "বাতিল" : "+ নতুন কোর্স"}
        </button>
      </div>

      {creating && (
        <form
          action={createCourse}
          className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"
        >
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">
            নতুন কোর্স তৈরি করুন
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field name="title" label="শিরোনাম" required />
            <Field name="slug" label="Slug" required placeholder="my-course" />
            <Field name="price" label="দাম (৳)" type="number" defaultValue={0} />
            <Field name="cover_image" label="কভার ইমেজ URL" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                বর্ণনা
              </label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                লেভেল
              </label>
              <select
                name="level"
                className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm font-medium text-zinc-700">
              <input type="checkbox" name="is_published" className="h-4 w-4" />
              পাবলিশ
            </label>
          </div>
          <button
            type="submit"
            className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            তৈরি করুন
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">কোর্স</th>
              <th className="px-4 py-3">দাম</th>
              <th className="px-4 py-3">লেভেল</th>
              <th className="px-4 py-3">স্ট্যাটাস</th>
              <th className="px-4 py-3">লেসন</th>
              <th className="px-4 py-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {courses.map((course) => (
              <Fragment key={course.id}>
                <tr className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                        {course.title.charAt(0)}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {course.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-700">
                    {formatPrice(course.price)}
                  </td>
                  <td className="px-4 py-3 capitalize text-zinc-600">
                    {course.level}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        course.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {course.is_published ? "পাবলিশড" : "ড্রাফট"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setOpenLessons(openLessons === course.id ? null : course.id)
                      }
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      {lessonsByCourse[course.id]?.length ?? 0}টি লেসন ▾
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setEditingId(editingId === course.id ? null : course.id)
                        }
                        className="rounded border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        disabled={pending}
                        className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        মুছুন
                      </button>
                    </div>
                  </td>
                </tr>

                {editingId === course.id && (
                  <tr key={`${course.id}-edit`}>
                    <td colSpan={6} className="bg-indigo-50/50 px-4 py-4">
                      <form action={updateCourse} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input type="hidden" name="id" value={course.id} />
                        <Field name="title" label="শিরোনাম" defaultValue={course.title} required />
                        <Field name="slug" label="Slug" defaultValue={course.slug} required />
                        <Field name="price" label="দাম (৳)" type="number" defaultValue={course.price} />
                        <Field name="cover_image" label="কভার ইমেজ URL" defaultValue={course.cover_image ?? ""} />
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-medium text-zinc-600">
                            বর্ণনা
                          </label>
                          <textarea
                            name="description"
                            rows={2}
                            defaultValue={course.description ?? ""}
                            className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-zinc-600">
                            লেভেল
                          </label>
                          <select
                            name="level"
                            defaultValue={course.level ?? "beginner"}
                            className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-zinc-700">
                          <input
                            type="checkbox"
                            name="is_published"
                            defaultChecked={course.is_published}
                            className="h-4 w-4"
                          />
                          পাবলিশ
                        </label>
                        <div className="flex items-end gap-2 lg:col-span-2">
                          <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                          >
                            আপডেট
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600"
                          >
                            বাতিল
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}

                {openLessons === course.id && (
                  <tr key={`${course.id}-lessons`}>
                    <td colSpan={6} className="bg-zinc-50 px-4 py-4">
                      <h4 className="mb-3 text-sm font-semibold text-zinc-900">
                        লেসনসমূহ
                      </h4>
                      {lessonsByCourse[course.id]?.length > 0 ? (
                        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-100 text-zinc-500">
                              <tr>
                                <th className="px-3 py-2">অর্ডার</th>
                                <th className="px-3 py-2">শিরোনাম</th>
                                <th className="px-3 py-2">সময়</th>
                                <th className="px-3 py-2">ফ্রি</th>
                                <th className="px-3 py-2 text-right">অ্যাকশন</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {lessonsByCourse[course.id].map((lesson) => (
                                <tr key={lesson.id}>
                                  <td className="px-3 py-2 text-zinc-500">{lesson.order}</td>
                                  <td className="px-3 py-2 font-medium text-zinc-800">
                                    {lesson.title}
                                  </td>
                                  <td className="px-3 py-2 text-zinc-500">
                                    {lesson.duration_minutes} মিনিট
                                  </td>
                                  <td className="px-3 py-2">
                                    {lesson.is_free ? (
                                      <i className="fa-solid fa-check text-green-600" />
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      মুছুন
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="mb-4 text-sm text-zinc-500">
                          কোনো লেসন নেই।
                        </p>
                      )}

                      <form
                        action={createLesson}
                        className="rounded-lg border border-zinc-200 bg-white p-3"
                      >
                        <input type="hidden" name="course_id" value={course.id} />
                        <p className="mb-2 text-xs font-semibold text-zinc-700">
                          + নতুন লেসন
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Field name="title" label="শিরোনাম" required />
                          <Field name="slug" label="Slug" required placeholder="lesson-1" />
                          <Field name="video_url" label="ভিডিও URL" />
                          <Field name="description" label="বর্ণনা" />
                          <Field name="duration_minutes" label="সময় (মিনিট)" type="number" defaultValue={0} />
                          <Field name="order" label="অর্ডার" type="number" defaultValue={0} />
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-zinc-600">
                              কনটেন্ট
                            </label>
                            <textarea
                              name="content"
                              rows={2}
                              className="w-full rounded border border-zinc-300 px-2.5 py-1.5 text-sm"
                            />
                          </div>
                          <label className="flex items-end gap-2 pb-2 text-sm font-medium text-zinc-700">
                            <input type="checkbox" name="is_free" className="h-4 w-4" />
                            ফ্রি প্রিভিউ
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          লেসন যোগ করুন
                        </button>
                      </form>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  কোনো কোর্স নেই। + নতুন কোর্স চেপে শুরু করুন।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}