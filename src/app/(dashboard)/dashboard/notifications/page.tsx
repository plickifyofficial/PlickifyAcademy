import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read";
import { markNotificationRead } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, link, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const list = (notifications ?? []) as unknown as {
    id: string;
    title: string;
    body: string | null;
    link: string | null;
    read: boolean;
    created_at: string;
  }[];

  const unread = list.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {unread > 0
              ? `${unread} unread notification${unread === 1 ? "" : "s"}`
              : "All caught up"}
          </p>
        </div>
        <MarkAllReadButton hasUnread={unread > 0} />
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl text-brand-600">
            <i className="fa-solid fa-bell-slash" />
          </span>
          <p className="mt-4 text-sm font-medium text-zinc-600">
            কোনো notification নেই এখনো।
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            Course update, live class reminder, quiz result সহ সব খবর এখানে পাবেন।
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {list.map((n, i) => (
            <Link
              key={n.id}
              href={n.link ?? "/dashboard"}
              onClick={() => {
                if (!n.read) void markNotificationRead(n.id);
              }}
              className={cn(
                "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-zinc-50",
                i > 0 && "border-t border-zinc-100",
                !n.read && "bg-brand-50/40",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base",
                  n.read ? "bg-zinc-100 text-zinc-400" : "bg-brand-100 text-brand-700",
                )}
              >
                <i className="fa-solid fa-bell" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    n.read ? "font-medium text-zinc-700" : "font-semibold text-zinc-900",
                  )}
                >
                  {!n.read && (
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-600 align-middle" />
                  )}
                  {n.title}
                </p>
                {n.body && <p className="mt-0.5 text-xs text-zinc-500">{n.body}</p>}
                <p className="mt-1 text-[11px] text-zinc-400">
                  {new Date(n.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!n.read && (
                <span className="mt-1 shrink-0 rounded-full bg-brand-600 px-2 py-px text-[10px] font-bold text-white">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}