import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    (user.user_metadata?.picture as string | undefined) ||
    "";
  const fullName = profile?.full_name || user.user_metadata?.full_name || "Student";

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-zinc-900">Profile</h1>
      <p className="mt-1 text-sm text-zinc-500">
        View your account information
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <AvatarUpload initialUrl={avatarUrl} name={fullName} />
        <div className="mt-4">
          <p className="text-lg font-semibold text-zinc-900">{fullName}</p>
          <p className="text-sm text-zinc-500">{user.email}</p>
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