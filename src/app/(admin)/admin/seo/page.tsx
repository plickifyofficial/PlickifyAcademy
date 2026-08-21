import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeoManager } from "@/components/admin/seo-manager";
import { getSeoOverrides, SEO_PAGES } from "@/lib/seo";

export const metadata = { title: "SEO Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const overrides = await getSeoOverrides();

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">SEO Settings</h1>
      <p className="wp-subtitle">
        Control how each page appears in Google and social shares — set a
        custom title and description per page.
      </p>

      <div className="mt-6">
        <SeoManager pages={SEO_PAGES} initial={overrides} />
      </div>
    </div>
  );
}
