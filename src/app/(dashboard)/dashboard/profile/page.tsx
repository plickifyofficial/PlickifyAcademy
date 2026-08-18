import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900">Profile</h1>
      <p className="mt-1 text-sm text-zinc-500">
        View your account information
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {(profile?.full_name || "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-zinc-900">
              {profile?.full_name || "Student"}
            </p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-400">
              Role
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-700">
              {profile?.role === "admin" ? "Admin" : "Student"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-400">
              Signed up
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-700">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US")
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <ProfileForm currentName={profile?.full_name ?? ""} />
      </div>
    </div>
  );
}