import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeSections } from "@/components/home/home-sections";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Preview | Plickify Academy",
  robots: { index: false, follow: false },
};

export default async function PreviewPage() {
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

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950">
        <i className="fa-solid fa-eye" />
        Draft Preview — changes are not live yet.
        <Link
          href="/admin/home"
          className="rounded-full bg-amber-950 px-3 py-1 text-xs font-bold text-amber-100 hover:bg-amber-900"
        >
          Back to Editor
        </Link>
      </div>
      <HomeSections useDrafts />
    </>
  );
}
