import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourses } from "@/lib/student";
import { MessageCompose } from "@/components/dashboard/message-compose";

export const metadata = { title: "Messages" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: showNew } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversationsRaw } = await supabase
    .from("conversations")
    .select(
      "id, subject, last_message_at, created_at, course_id, courses(title), messages(count)",
    )
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  const { data: messagesRaw } = await supabase
    .from("messages")
    .select("conversation_id, id")
    .neq("sender_id", user.id)
    .eq("is_read", false);

  const conversations = (conversationsRaw ?? []) as unknown as Array<{
    id: string;
    subject: string;
    last_message_at: string;
    created_at: string;
    course_id: string | null;
    courses: { title: string } | null;
  }>;
  const unreadIds = new Set((messagesRaw ?? []).map((m) => m.conversation_id));

  const courses = await getEnrolledCourses(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Messages</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Chat with our support team and instructors.
          </p>
        </div>
        <Link
          href="/dashboard/messages?new=1"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <i className="fa-solid fa-plus" /> New Message
        </Link>
      </div>

      {showNew === "1" ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-zinc-900">
            Start a new conversation
          </h2>
          <MessageCompose courses={courses.map((c) => ({ id: c.id, title: c.title }))} />
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-envelope" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">No messages</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Start a conversation with our support team if you need help.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <ul className="divide-y divide-zinc-100">
            {conversations.map((c) => {
              const isUnread = unreadIds.has(c.id);
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/messages/${c.id}`}
                    className={`flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-50 ${
                      isUnread ? "bg-brand-50/50" : ""
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${
                        isUnread
                          ? "bg-brand-600"
                          : "bg-zinc-300"
                      }`}
                    >
                      <i className="fa-solid fa-comment-dots" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`truncate text-sm ${
                            isUnread ? "font-bold text-zinc-900" : "font-semibold text-zinc-700"
                          }`}
                        >
                          {c.subject}
                        </p>
                        <span className="shrink-0 text-[11px] text-zinc-400">
                          {new Date(c.last_message_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {c.courses?.title ?? "General support"}
                      </p>
                    </div>
                    {isUnread && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}