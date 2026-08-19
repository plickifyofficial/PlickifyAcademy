"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/actions/notifications";

async function staffRecipientFor(courseId: string | null): Promise<string | null> {
  const admin = createAdminClient();
  if (courseId) {
    const { data: course } = await admin
      .from("courses")
      .select("created_by")
      .eq("id", courseId)
      .single();
    if (course?.created_by) return course.created_by;
  }
  const { data: adminProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  return adminProfile?.id ?? null;
}

export async function startConversation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subject = String(formData.get("subject")).trim();
  const body = String(formData.get("body")).trim();
  const courseId = String(formData.get("course_id") || "").trim() || null;
  if (!subject || body.length < 5) throw new Error("Please provide a subject and message.");

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, course_id: courseId, subject, last_message_at: new Date().toISOString() })
    .select("id, course_id")
    .single();
  if (error) throw new Error(error.message);

  const { error: msgErr } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    body,
  });
  if (msgErr) throw new Error(msgErr.message);

  const staff = await staffRecipientFor(conversation.course_id);
  if (staff) {
    await createNotification(staff, "New support message", subject, `/admin/messages`);
  }

  revalidatePath("/dashboard/messages");
  revalidatePath("/admin/messages");
  return conversation.id;
}

export async function sendMessage(conversationId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (body.trim().length < 1) throw new Error("Message is empty.");
  const clean = body.trim();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("user_id, course_id, subject")
    .eq("id", conversationId)
    .single();
  if (!conversation) throw new Error("Conversation not found.");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: clean,
  });
  if (error) throw new Error(error.message);

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  const isStaff = user.id !== conversation.user_id;
  if (isStaff) {
    await createNotification(
      conversation.user_id,
      "New reply to your message",
      conversation.subject,
      `/dashboard/messages/${conversationId}`,
    );
  } else {
    const staff = await staffRecipientFor(conversation.course_id);
    if (staff) {
      await createNotification(staff, "New support message", conversation.subject, `/admin/messages`);
    }
  }

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/admin/messages");
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  revalidatePath("/admin/messages");
  revalidatePath("/dashboard/messages");
}

export async function getUnreadMessageCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", user.id);

  const ids = (conversations ?? []).map((c) => c.id);
  if (ids.length === 0) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}