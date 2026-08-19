"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateContactMessageStatus,
  markContactMessageRead,
  deleteContactMessage,
} from "@/lib/actions/contact";
import { useToast } from "@/components/ui/toaster";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  is_read: boolean;
  created_at: string;
};

const STATUSES = ["New", "In Progress", "Replied", "Closed"];

const statusClass: Record<string, string> = {
  New: "wp-tag-red",
  "In Progress": "wp-tag-amber",
  Replied: "wp-tag-green",
  Closed: "wp-tag-gray",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ContactMessages({ messages }: { messages: ContactMessage[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const unread = messages.filter((m) => !m.is_read).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (subject !== "All" && m.subject !== subject) return false;
      if (status !== "All" && m.status !== status) return false;
      if (
        q &&
        !`${m.name} ${m.email} ${m.message} ${m.subject}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [messages, search, subject, status]);

  async function run(fn: () => Promise<{ success?: boolean; error?: string } | undefined>, msg: string) {
    const res = await fn();
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    showToast(msg);
    router.refresh();
  }

  const subjects = useMemo(
    () => Array.from(new Set(messages.map((m) => m.subject))).sort(),
    [messages],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, message..."
            className="wp-input !w-64"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="wp-input !w-auto"
          >
            <option value="All">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="wp-input !w-auto"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <span className="wp-tag wp-tag-red">
          {unread} New
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="wp-panel">
          <div className="wp-panel-body text-sm text-[#646970]">
            No contact messages found.
          </div>
        </div>
      ) : (
        <div className="wp-panel">
          <div className="overflow-x-auto">
            <table className="wp-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <Fragment key={m.id}>
                    <tr
                      className={m.is_read ? "" : "bg-[#f0f7ff]"}
                      onClick={() =>
                        setExpanded((e) => (e === m.id ? null : m.id))
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div>
                          <p className="font-semibold text-[#1d2327]">
                            {m.name}
                            {!m.is_read && (
                              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#d63638]" />
                            )}
                          </p>
                          <p className="text-xs text-[#646970]">{m.email}</p>
                          {m.phone && (
                            <p className="text-xs text-[#646970]">{m.phone}</p>
                          )}
                        </div>
                      </td>
                      <td>{m.subject}</td>
                      <td>
                        <span className={statusClass[m.status] ?? "wp-tag"}>
                          {m.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-xs text-[#646970]">
                        {formatDate(m.created_at)}
                      </td>
                      <td>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => run(() => markContactMessageRead(m.id, !m.is_read), m.is_read ? "Marked unread" : "Marked read")}
                            className="wp-icon-btn"
                            title={m.is_read ? "Mark unread" : "Mark read"}
                          >
                            <i className={`fa-solid ${m.is_read ? "fa-envelope-open" : "fa-envelope"}`} />
                          </button>
                          <select
                            value={m.status}
                            onChange={(e) =>
                              run(() => updateContactMessageStatus(m.id, e.target.value), "Status updated")
                            }
                            className="wp-input !w-auto !py-1.5 !text-xs"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              if (!window.confirm("Delete this message?")) return;
                              run(() => deleteContactMessage(m.id), "Message deleted");
                            }}
                            className="wp-icon-btn wp-icon-btn-danger"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded === m.id && (
                      <tr>
                        <td colSpan={5}>
                          <div className="bg-[#f6f7f7] p-4">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <a
                                href={`mailto:${m.email}`}
                                className="wp-btn wp-btn-primary !py-1.5 !text-xs"
                              >
                                <i className="fa-solid fa-reply" /> Reply
                              </a>
                              <span className="text-xs text-[#646970]">
                                Message:
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3c434a]">
                              {m.message}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}