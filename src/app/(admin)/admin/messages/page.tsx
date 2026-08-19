import { createClient } from "@/lib/supabase/server";
import { AdminMessagesInbox } from "@/components/admin/admin-messages-inbox";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();

  const isAdmin = profile?.role === "admin";
  const isInstructor = profile?.role === "instructor";

  const { data: conversationsRaw } = await supabase
    .from("conversations")
    .select(
      "id, subject, course_id, last_message_at, created_at, user_id, courses(title, created_by), profiles(full_name)",
    )
    .order("last_message_at", { ascending: false })
    .limit(200);

  const conversations = ((conversationsRaw ?? []) as unknown as Array<{
    id: string;
    subject: string;
    course_id: string | null;
    last_message_at: string;
    created_at: string;
    user_id: string;
    courses: { title: string; created_by: string | null } | null;
    profiles: { full_name: string | null } | null;
  }>).filter((c) => {
    if (isAdmin) return true;
    if (isInstructor && c.courses?.created_by === user?.id) return true;
    return false;
  });

  const convIds = conversations.map((c) => c.id);
  const { data: messagesRaw } =
    convIds.length > 0
      ? await supabase
          .from("messages")
          .select("id, conversation_id, sender_id, body, is_read, created_at, profiles(full_name)")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: true })
          .limit(5000)
      : { data: [] };

  const messages = ((messagesRaw ?? []) as unknown as Array<{
    id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    is_read: boolean;
    created_at: string;
    profiles: { full_name: string | null } | null;
  }>).map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    body: m.body,
    createdAt: m.created_at,
    author: m.profiles?.full_name || "User",
    fromStudent: m.sender_id !== user?.id,
  }));

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">Support Messages</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Conversations from students. Reply to help them out.
      </p>
      <div className="mt-5">
        <AdminMessagesInbox
          conversations={conversations.map((c) => ({
            id: c.id,
            subject: c.subject,
            courseTitle: c.courses?.title ?? null,
            student: c.profiles?.full_name || "Student",
            lastMessageAt: c.last_message_at,
          }))}
          messages={messages}
        />
      </div>
    </div>
  );
}