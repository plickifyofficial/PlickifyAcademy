import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Faq, Testimonial } from "@/lib/types";

export const contentModuleTag = "content-modules";

export async function readPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(24);
    if (error) return [];
    return (data ?? []) as Testimonial[];
  } catch {
    return [];
  }
}

export async function readPublishedFaqs(
  page: Faq["page"],
): Promise<Pick<Faq, "question" | "answer">[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer")
      .eq("page", page)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as Pick<Faq, "question" | "answer">[];
  } catch {
    return [];
  }
}

export async function readCategories(type: Category["type"]): Promise<Category[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("type", type)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
}

export const getPublishedTestimonials = unstable_cache(
  readPublishedTestimonials,
  ["content-modules-testimonials"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPublishedFaqs = unstable_cache(
  async (page: Faq["page"]) => readPublishedFaqs(page),
  ["content-modules-faqs"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getCategories = unstable_cache(
  async (type: Category["type"]) => readCategories(type),
  ["content-modules-categories"],
  { revalidate: 60, tags: [contentModuleTag] },
);
