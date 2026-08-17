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
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">নাম</th>
            <th className="px-4 py-3">ইমেইল</th>
            <th className="px-4 py-3">ভূমিকা</th>
            <th className="px-4 py-3">যোগদান</th>
            <th className="px-4 py-3 text-right">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {students.map((s) => (
            <tr key={s.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {(s.full_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-zinc-900">
                    {s.full_name || "—"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-600">{s.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    s.role === "admin"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {s.role === "admin" ? "অ্যাডমিন" : "স্টুডেন্ট"}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-500">
                {new Date(s.created_at).toLocaleDateString("bn-BD")}
              </td>
              <td className="px-4 py-3">
                {s.id !== currentUserId && (
                  <div className="flex justify-end">
                    <form
                      action={setUserRole}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="user_id" value={s.id} />
                      {s.role === "admin" ? (
                        <>
                          <input type="hidden" name="role" value="student" />
                          <button className="rounded border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
                            অ্যাডমিন সরান
                          </button>
                        </>
                      ) : (
                        <>
                          <input type="hidden" name="role" value="admin" />
                          <button className="rounded border border-indigo-300 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                            অ্যাডমিন বানান
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
              <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                কোনো ব্যবহারকারী নেই।
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}