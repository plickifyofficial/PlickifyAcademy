import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageThread } from "@/components/dashboard/message-thread";

export const metadata = { title: "Conversation" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, subject, course_id, courses(title)")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) notFound();

  const { data: messagesRaw } = await supabase
    .from("messages")
    .select("id, sender_id, body, is_read, created_at, profiles(full_name)")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(500);

  const messages = (messagesRaw ?? []).map((m) => {
    const p = m.profiles as unknown as { full_name: string | null } | null;
    return {
      id: m.id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at,
      author: p?.full_name || "User",
      own: m.sender_id === user.id,
    };
  });

  const course = conversation.courses as unknown as { title: string } | null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <nav className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/messages" className="hover:text-brand-600">
          Messages
        </Link>
        <i className="fa-solid fa-chevron-right text-[10px]" />
        <span className="truncate font-medium text-zinc-900">
          {conversation.subject}
        </span>
      </nav>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-900">
          {conversation.subject}
        </h1>
        {course && (
          <p className="mt-1 text-sm text-zinc-500">
            Course: {course.title}
          </p>
        )}
      </div>

      <MessageThread
        conversationId={conversation.id}
        messages={messages}
      />
    </div>
  );
}