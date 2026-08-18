"use client";

import { useState } from "react";
import { enrollStudent, unenrollStudent } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toaster";

type Enrollment = {
  id: string;
  created_at: string;
  user_id: string;
  course_id: string;
  profiles: { email: string } | null;
  courses: { title: string } | null;
};

export function EnrollmentsPanel({
  courses,
  enrollments,
}: {
  courses: { id: string; title: string }[];
  enrollments: Enrollment[];
}) {
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function handleEnroll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    try {
      const result = await enrollStudent(new FormData(form));
      if (result.error) {
        showToast(result.error, "error");
      } else {
        form.reset();
        showToast("Student enrolled");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not enroll", "error");
    } finally {
      setPending(false);
    }
  }

  async function handleUnenroll(id: string) {
    if (!confirm("Delete this enrollment?")) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("id", id);
      const result = await unenrollStudent(fd);
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("Enrollment deleted");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <form onSubmit={handleEnroll} className="wp-panel">
        <div className="wp-panel-header">
          New Enrollment
        </div>
        <div className="wp-panel-body">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="wp-label">Course</label>
              <select name="course_id" required className="wp-input">
                <option value="">— Select a course —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="wp-label">Student Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="student@example.com"
                className="wp-input"
              />
            </div>
          </div>
          <button type="submit" className="wp-btn wp-btn-primary mt-3" disabled={pending}>
            <i className="fa-solid fa-user-plus" /> {pending ? "Enrolling..." : "Enroll"}
          </button>
        </div>
      </form>

      <div className="wp-panel">
        <div className="wp-panel-header">
          All Enrollments
          <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
            {enrollments.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="wp-table min-w-[560px]">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#646970]">
                    No enrollments yet.
                  </td>
                </tr>
              )}
              {enrollments.map((en) => (
                <tr key={en.id}>
                  <td className="font-medium text-[#1d2327]">
                    {en.profiles?.email ?? en.user_id}
                  </td>
                  <td className="text-[#3c434a]">{en.courses?.title ?? "—"}</td>
                  <td className="text-[#646970]">
                    {new Date(en.created_at).toLocaleDateString("en-US")}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleUnenroll(en.id)}
                      disabled={pending}
                      className="wp-btn wp-btn-danger"
                    >
                      <i className="fa-solid fa-user-minus" /> Unenroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}