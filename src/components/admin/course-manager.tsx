"use client";

import { useState } from "react";
import type { Course, Lesson } from "@/lib/types";
import { createCourse, updateCourse, deleteCourse, createLesson, deleteLesson, makeAdmin } from "@/lib/actions/admin";

function SubmitBtn({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "সেভ হচ্ছে..." : children}
    </button>
  );
}

export function CourseForm({
  course,
  onDone,
}: {
  course?: Course;
  onDone?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const action = course ? updateCourse : createCourse;
    const result = await action(fd);
    setPending(false);
    if (result?.error) setError(result.error);
    else onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5">
      {course && <input type="hidden" name="id" value={course.id} />}
      <h3 className="font-semibold text-zinc-900">
        {course ? "কোর্স এডিট করুন" : "নতুন কোর্স"}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field name="title" label="শিরোনাম" required defaultValue={course?.title} />
        <Field name="slug" label="Slug" required defaultValue={course?.slug} placeholder="my-course" />
      </div>

      <Field name="description" label="বর্ণনা" textarea defaultValue={course?.description ?? ""} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field name="price" label="দাম (৳)" type="number" defaultValue={course?.price} />
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">লেভেল</label>
          <select
            name="level"
            defaultValue={course?.level ?? "beginner"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <Field name="cover_image" label="কভার ইমেজ URL" defaultValue={course?.cover_image ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input type="checkbox" name="is_published" defaultChecked={course?.is_published} className="h-4 w-4" />
        পাবলিশ করুন
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <SubmitBtn pending={pending}>{course ? "আপডেট" : "তৈরি করুন"}</SubmitBtn>
        {course && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
          >
            বাতিল
          </button>
        )}
      </div>
    </form>
  );
}

export function LessonForm({ courseId }: { courseId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await createLesson(fd);
    setPending(false);
    if (result?.error) setError(result.error);
    else e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <input type="hidden" name="course_id" value={courseId} />
      <h4 className="text-sm font-semibold text-zinc-900">নতুন লেসন</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field name="title" label="লেসন শিরোনাম" required />
        <Field name="slug" label="Slug" required placeholder="lesson-1" />
      </div>
      <Field name="description" label="ছোট বর্ণনা" defaultValue="" />
      <Field name="video_url" label="ভিডিও URL (YouTube/M3U8)" defaultValue="" />
      <div className="grid grid-cols-2 gap-3">
        <Field name="duration_minutes" label="সময় (মিনিট)" type="number" defaultValue={0} />
        <Field name="order" label="অর্ডার" type="number" defaultValue={0} />
      </div>
      <Field name="content" label="লেসন কনটেন্ট" textarea defaultValue="" />
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input type="checkbox" name="is_free" className="h-4 w-4" />
        ফ্রি প্রিভিউ
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SubmitBtn pending={pending}>লেসন যোগ করুন</SubmitBtn>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required,
  type = "text",
  textarea,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      {textarea ? (
        <textarea name={name} rows={3} defaultValue={defaultValue} className={cls} />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          step={type === "number" ? "0.01" : undefined}
          className={cls}
        />
      )}
    </div>
  );
}

export function CourseManager({
  courses,
  lessonsByCourse,
  adminUserId,
}: {
  courses: Course[];
  lessonsByCourse: Record<string, Lesson[]>;
  adminUserId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [makeAdminId, setMakeAdminId] = useState("");
  const [pending, setPending] = useState(false);

  async function handleDelete(course: Course) {
    if (!confirm(`"${course.title}" মুছে ফেলবেন?`)) return;
    setPending(true);
    const fd = new FormData();
    fd.set("id", course.id);
    await deleteCourse(fd);
    setPending(false);
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("লেসন মুছে ফেলবেন?")) return;
    const fd = new FormData();
    fd.set("id", lessonId);
    await deleteLesson(fd);
  }

  async function handleMakeAdmin() {
    if (!makeAdminId.trim()) return;
    const fd = new FormData();
    fd.set("user_id", makeAdminId.trim());
    await makeAdmin(fd);
    setMakeAdminId("");
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => setCreating((v) => !v)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        {creating ? "বন্ধ করুন" : "+ নতুন কোর্স"}
      </button>

      {creating && (
        <CourseForm
          onDone={() => {
            setCreating(false);
          }}
        />
      )}

      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-zinc-900">{course.title}</h3>
                <p className="text-sm text-zinc-500">
                  {course.is_published ? "✅ পাবলিশড" : "⏸️ ড্রাফট"} · {formatPriceAdmin(course.price)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === course.id ? null : course.id)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  এডিট
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  disabled={pending}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  মুছুন
                </button>
              </div>
            </div>

            {editingId === course.id && (
              <div className="mt-4">
                <CourseForm
                  course={course}
                  onDone={() => setEditingId(null)}
                />
              </div>
            )}

            <div className="mt-5 border-t border-zinc-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold text-zinc-900">
                লেসন ({lessonsByCourse[course.id]?.length ?? 0})
              </h4>
              <div className="space-y-2">
                {(lessonsByCourse[course.id] ?? []).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <span className="text-zinc-700">
                      {lesson.order}. {lesson.title}
                      {lesson.is_free && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          ফ্রি
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      মুছুন
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <LessonForm courseId={course.id} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="font-semibold text-zinc-900">কাউকে অ্যাডমিন বানান</h3>
        <p className="mt-1 text-sm text-zinc-500">
          অ্যাডমিন হতে চাওয়া user-এর UUID দিন (আপনার নিজের UUID: {adminUserId})।
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={makeAdminId}
            onChange={(e) => setMakeAdminId(e.target.value)}
            placeholder="user UUID"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleMakeAdmin}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            বানান
          </button>
        </div>
      </div>
    </div>
  );
}

function formatPriceAdmin(price: number) {
  return `৳${price.toLocaleString("en-IN")}`;
}