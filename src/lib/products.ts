import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as Product[];
}