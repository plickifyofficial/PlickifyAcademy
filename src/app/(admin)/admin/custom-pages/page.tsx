import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CustomPagesManager,
  type CustomPageRow,
} from "@/components/admin/custom-pages-manager";

export const dynamic = "force-dynamic";

export default async function AdminCustomPagesPage() {
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

  // Admins need all pages (including drafts) — use service role.
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("custom_pages")
    .select("id, slug, title, body, is_published, show_in_footer")
    .order("created_at", { ascending: false });

  const pages: CustomPageRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    body: r.body,
    is_published: r.is_published,
    show_in_footer: r.show_in_footer,
  }));

  return (
    <div className="max-w-5xl">
      <h1 className="wp-page-title">Custom Pages</h1>
      <p className="wp-subtitle">
        Create your own pages — policies, guides, landing pages — and link them
        anywhere. Published pages are public; tick &quot;Footer&quot; to list them in
        the site footer.
      </p>

      <div className="mt-6">
        <CustomPagesManager initialPages={pages} />
      </div>
    </div>
  );
}
