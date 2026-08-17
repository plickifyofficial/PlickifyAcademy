"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyNotifications,
  markAllNotificationsRead,
} from "@/lib/actions/notifications";

type Item = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await getMyNotifications();
    setItems(res.list);
    setUnread(res.unread);
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      const res = await getMyNotifications();
      setItems(res.list);
      setUnread(res.unread);
      setLoading(false);
    }
    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => clearInterval(timer);
  }, []);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open) void refresh();
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
        aria-label="নোটিফিকেশন"
      >
        <i className="fa-solid fa-bell" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">
                নোটিফিকেশন
              </p>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  সব পড়া হয়েছে
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <p className="px-4 py-8 text-center text-sm text-zinc-400">
                  লোড হচ্ছে...
                </p>
              )}
              {!loading && items.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-zinc-400">
                  কোনো নোটিফিকেশন নেই।
                </p>
              )}
              {items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "/dashboard"}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-zinc-50 px-4 py-3 hover:bg-zinc-50 ${
                    n.read ? "" : "bg-brand-50/50"
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {!n.read && (
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-600 align-middle" />
                    )}
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-zinc-400">
                    {new Date(n.created_at).toLocaleDateString("bn-BD", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}