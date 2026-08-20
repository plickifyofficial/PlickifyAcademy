"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";
import { contactSettingsTag } from "@/lib/contact-settings";

const SUBJECTS = [
  "Course Inquiry",
  "Admission",
  "Payment Issue",
  "Digital Product",
  "Technical Support",
  "Partnership",
  "General Question",
];

const MAX_LEN = {
  name: 100,
  email: 150,
  phone: 30,
  subject: 60,
  message: 3000,
};

function clean(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

export async function submitContactMessage(formData: FormData) {
  const name = clean(String(formData.get("name") ?? "")).slice(0, MAX_LEN.name);
  const email = clean(String(formData.get("email") ?? "")).slice(
    0,
    MAX_LEN.email,
  );
  const phone = clean(String(formData.get("phone") ?? "")).slice(
    0,
    MAX_LEN.phone,
  );
  const subjectRaw = clean(String(formData.get("subject") ?? ""));
  const message = clean(String(formData.get("message") ?? "")).slice(
    0,
    MAX_LEN.message,
  );

  if (!name) return { error: "দয়া করে আপনার নাম লিখুন।" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "দয়া করে একটি সঠিক email লিখুন।" };
  if (!message || message.length < 5)
    return { error: "দয়া করে আপনার মেসেজ লিখুন।" };

  const subject = SUBJECTS.includes(subjectRaw) ? subjectRaw : "General Question";

  const supabase = await createClient();

  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 60_000).toISOString());

  if ((count ?? 0) >= 3)
    return {
      error: "খুব বেশি বার মেসেজ পাঠানো হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone,
    subject,
    message,
  });

  if (error) return { error: "মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।" };

  revalidatePath("/admin/contact");
  return { success: true };
}

export async function updateContactMessageStatus(
  id: string,
  status: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const allowed = ["New", "In Progress", "Replied", "Closed"];
  if (!allowed.includes(status)) return { error: "Invalid status" };

  const { error } = await supabase
    .from("contact_messages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/contact");
  return { success: true };
}

export async function markContactMessageRead(id: string, read: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: read, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/contact");
  return { success: true };
}

export async function deleteContactMessage(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/contact");
  return { success: true };
}

// ============================================================
// Floating Contact System (Phase 8)
// ============================================================

export async function saveContactSettings(
  value: string,
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { error: "Invalid settings JSON." };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("site_content")
    .upsert(
      { key: "contact.settings", value: parsed, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) return { error: error.message };
  updateTag(contactSettingsTag);
  revalidatePath("/admin/contact-system");
  return { success: true };
}

export async function logContactEvent(
  eventType: string,
  label?: string,
  path?: string,
) {
  const admin = createAdminClient();
  try {
    await admin.from("contact_events").insert({
      event_type: eventType,
      label: label ?? null,
      path: path ?? null,
    });
  } catch {
    // analytics are best-effort — never block the UI
  }
}

export async function submitOfflineMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ error?: string; success?: boolean }> {
  if (!input.name.trim() || !input.email.trim() || !input.message.trim()) {
    return { error: "Please fill in your name, email and message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { error: "Please enter a valid email address." };
  }
  const admin = createAdminClient();
  const { error } = await admin.from("contact_messages").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    subject: "Live Chat Offline",
    message: input.message.trim(),
    status: "New",
    is_read: false,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/contact");
  return { success: true };
}