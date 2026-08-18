"use client";

import { useState } from "react";
import { setUserRole } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toaster";

type Student = {
  id: string;
  full_name: string | null;
  email: string;
  role: "student" | "admin" | "instructor";
  created_at: string;
};

export function StudentsTable({
  students,
  currentUserId,
}: {
  students: Student[];
  currentUserId: string;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleRole(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setPendingId(id);
    try {
      await setUserRole(new FormData(e.currentTarget));
      showToast("Role updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update", "error");
    } finally {
      setPendingId(null);
    }
  }
  return (
    <div className="wp-panel">
      <div className="wp-panel-header">
        All Users
        <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
          {students.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="wp-table min-w-[640px]">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="wp-avatar h-9 w-9 text-sm">
                      {(s.full_name || "S").charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-[#1d2327]">
                      {s.full_name || "—"}
                    </span>
                  </div>
                </td>
                <td className="text-[#3c434a]">{s.email}</td>
                <td>
                  <span
                    className={`wp-tag ${
                      s.role === "admin"
                        ? "wp-tag-blue"
                        : s.role === "instructor"
                          ? "wp-tag-purple"
                          : "wp-tag-gray"
                    }`}
                  >
                    {s.role === "admin" ? (
                      <>
                        <i className="fa-solid fa-shield-halved text-[10px]" /> Admin
                      </>
                    ) : s.role === "instructor" ? (
                      <>
                        <i className="fa-solid fa-chalkboard-user text-[10px]" /> Instructor
                      </>
                    ) : (
                      "Student"
                    )}
                  </span>
                </td>
                <td className="text-[#646970]">
                  {new Date(s.created_at).toLocaleDateString("en-US")}
                </td>
                <td>
                  {s.id !== currentUserId && (
                    <div className="flex justify-end gap-2">
                      <form onSubmit={(e) => handleRole(e, s.id)}>
                        <input type="hidden" name="user_id" value={s.id} />
                        {s.role === "admin" ? (
                          <>
                            <input type="hidden" name="role" value="student" />
                            <button className="wp-btn wp-btn-danger" disabled={pendingId === s.id}>
                              <i className="fa-solid fa-user-slash" /> Remove Admin
                            </button>
                          </>
                        ) : s.role === "instructor" ? (
                          <>
                            <input type="hidden" name="role" value="admin" />
                            <button className="wp-btn" disabled={pendingId === s.id}>
                              <i className="fa-solid fa-user-shield" /> Make Admin
                            </button>
                            <input type="hidden" name="role" value="student" />
                            <button className="wp-btn wp-btn-danger" disabled={pendingId === s.id}>
                              <i className="fa-solid fa-user-slash" /> Remove Instructor
                            </button>
                          </>
                        ) : (
                          <>
                            <input type="hidden" name="role" value="instructor" />
                            <button className="wp-btn" disabled={pendingId === s.id}>
                              <i className="fa-solid fa-chalkboard-user" /> Instructor
                            </button>
                            <input type="hidden" name="role" value="admin" />
                            <button className="wp-btn" disabled={pendingId === s.id}>
                              <i className="fa-solid fa-user-shield" /> Make Admin
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#646970]">
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}