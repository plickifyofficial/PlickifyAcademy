"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";

export async function deleteMedia(formData: FormData) {
  await requireAdmin();

  const bucket = String(formData.get("bucket"));
  const path = String(formData.get("path"));

  if (!bucket || !path) return;

  const admin = createAdminClient();
  await admin.storage.from(bucket).remove([path]);

  revalidatePath("/admin/media");
}