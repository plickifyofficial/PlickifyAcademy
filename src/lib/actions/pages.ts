"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/actions/admin";
import { sanitizeHtml } from "@/lib/rte";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function createCustomPage(title: string) {
  await requireAdmin();
  const clean = title.trim();
  if (!clean) throw new Error("Page title is required");

  const admin = createAdminClient();
  const base = slugify(clean) || "page";

  // Ensure a unique slug.
  let slug = base;
  for (let i = 2; ; i++) {
    const { data: existing } = await admin
      .from("custom_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${base}-${i}`;
  }

  const { data, error } = await admin
    .from("custom_pages")
    .insert({ slug, title: clean })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/custom-pages");
  revalidatePath("/", "layout");
  return { id: data.id as string, slug };
}

export async function updateCustomPage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    body?: string;
    is_published?: boolean;
    show_in_footer?: boolean;
  },
) {
  await requireAdmin();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.title !== undefined) {
    const t = data.title.trim();
    if (!t) throw new Error("Page title is required");
    update.title = t;
  }
  if (data.slug !== undefined) {
    const s = slugify(data.slug);
    if (!s) throw new Error("Invalid URL slug");
    update.slug = s;

    const admin = createAdminClient();
    const { data: clash } = await admin
      .from("custom_pages")
      .select("id")
      .eq("slug", s)
      .neq("id", id)
      .maybeSingle();
    if (clash) throw new Error("This URL slug is already in use");
  }
  if (data.body !== undefined) update.body = sanitizeHtml(data.body);
  if (data.is_published !== undefined) update.is_published = !!data.is_published;
  if (data.show_in_footer !== undefined)
    update.show_in_footer = !!data.show_in_footer;

  const admin = createAdminClient();
  const { error } = await admin
    .from("custom_pages")
    .update(update)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/custom-pages");
  revalidatePath("/", "layout");
  const slug = (update.slug as string) || undefined;
  if (slug) revalidatePath(`/p/${slug}`);
}

export async function deleteCustomPage(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("custom_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/custom-pages");
  revalidatePath("/", "layout");
}
