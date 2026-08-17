"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createNotification(
  userId: string,
  title: string,
  body?: string | null,
  link?: string | null,
) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: userId,
    title,
    body: body ?? null,
    link: link ?? null,
  });
}

export type NotificationsResult = {
  list: {
    id: string;
    title: string;
    body: string | null;
    link: string | null;
    read: boolean;
    created_at: string;
  }[];
  unread: number;
};

export async function getMyNotifications(): Promise<NotificationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { list: [], unread: 0 };

  const { data, count } = await supabase
    .from("notifications")
    .select("id, title, body, link, read, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: all } = await supabase
    .from("notifications")
    .select("id, title, body, link, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    list: (all ?? []) as unknown as NotificationsResult["list"],
    unread: count ?? (data?.length ?? 0),
  };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  revalidatePath("/dashboard");
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);
}