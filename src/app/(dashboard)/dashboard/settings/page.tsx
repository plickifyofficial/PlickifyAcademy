import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("email_notifications, push_notifications, marketing_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your notification preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold text-zinc-900">Account</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-400">
              Email
            </dt>
            <dd className="mt-1 break-all text-sm font-medium text-zinc-700">
              {user.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-400">
              Member since
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-700">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <SettingsForm
        emailNotifications={prefs?.email_notifications ?? true}
        pushNotifications={prefs?.push_notifications ?? true}
        marketingOptIn={prefs?.marketing_opt_in ?? false}
      />
    </div>
  );
}