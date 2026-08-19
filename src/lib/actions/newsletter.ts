"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("newsletter_subscribers").upsert(
    { email, status: "active" },
    { onConflict: "email" },
  );
  if (error) return { error: error.message };

  return { success: true };
}

export async function toggleSubscriber(
  id: string,
  status: "active" | "unsubscribed",
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function deleteSubscriber(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/newsletter");
  return { success: true };
}