"use client";

import { setUserRole } from "@/lib/actions/admin";

type Student = {
  id: string;
  full_name: string | null;
  email: string;
  role: "student" | "admin";
  created_at: string;
};

export function StudentsTable({
  students,
  currentUserId,
}: {
  students: Student[];
  currentUserId: string;
}) {
  return (
    <div className="wp-panel">
      <div className="wp-panel-header">
        সব ব্যবহারকারী
        <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
          {students.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="wp-table min-w-[640px]">
          <thead>
            <tr>
              <th>নাম</th>
              <th>ইমেইল</th>
              <th>ভূমিকা</th>
              <th>যোগদান</th>
              <th className="text-right">অ্যাকশন</th>
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
                  <span className={`wp-tag ${s.role === "admin" ? "wp-tag-blue" : "wp-tag-gray"}`}>
                    {s.role === "admin" ? (
                      <>
                        <i className="fa-solid fa-shield-halved text-[10px]" /> অ্যাডমিন
                      </>
                    ) : (
                      "স্টুডেন্ট"
                    )}
                  </span>
                </td>
                <td className="text-[#646970]">
                  {new Date(s.created_at).toLocaleDateString("bn-BD")}
                </td>
                <td>
                  {s.id !== currentUserId && (
                    <div className="flex justify-end">
                      <form action={setUserRole}>
                        <input type="hidden" name="user_id" value={s.id} />
                        {s.role === "admin" ? (
                          <>
                            <input type="hidden" name="role" value="student" />
                            <button className="wp-btn wp-btn-danger">
                              <i className="fa-solid fa-user-slash" /> অ্যাডমিন সরান
                            </button>
                          </>
                        ) : (
                          <>
                            <input type="hidden" name="role" value="admin" />
                            <button className="wp-btn">
                              <i className="fa-solid fa-user-shield" /> অ্যাডমিন বানান
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
                  কোনো ব্যবহারকারী নেই।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}