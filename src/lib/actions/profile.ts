"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name")).trim();
  const phone = String(formData.get("phone")).trim();
  const location = String(formData.get("location")).trim();
  const bio = String(formData.get("bio")).trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, location, bio })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file selected" };
  if (file.size > 2 * 1024 * 1024)
    return { error: "Image must be under 2MB" };

  const ext = (file.name.split(".").pop() || "png").replace(/[^a-z0-9]/gi, "");
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) return { error: upErr.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: dbErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);
  if (dbErr) return { error: dbErr.message };

  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true, url: publicUrl };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);
  if (error) return { error: error.message };

  await supabase.auth.updateUser({ data: { avatar_url: null } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const emailNotifications = formData.get("email_notifications") === "on";
  const pushNotifications = formData.get("push_notifications") === "on";
  const marketingOptIn = formData.get("marketing_opt_in") === "on";

  const { error } = await supabase.from("user_preferences").upsert(
    {
      id: user.id,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      marketing_opt_in: marketingOptIn,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}