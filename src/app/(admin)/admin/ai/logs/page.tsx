import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback: string | null;
  created_at: string;
};

type Conv = {
  id: string;
  session_id: string;
  first_message: string;
  message_count: number;
  updated_at: string;
  messages: Msg[];
};

export default async function AiLogsPage() {
  const admin = createAdminClient();
  const { data: convs } = await admin
    .from("ai_conversations")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(20);

  const list: Conv[] = [];
  for (const c of convs ?? []) {
    const { data: msgs } = await admin
      .from("ai_messages")
      .select("id, role, content, feedback, created_at")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: true })
      .limit(60);
    list.push({
      id: c.id,
      session_id: c.session_id,
      first_message: c.first_message,
      message_count: c.message_count,
      updated_at: c.updated_at,
      messages: (msgs ?? []) as Msg[],
    });
  }

  return (
    <div className="space-y-4">
      <p className="wp-subtitle !mt-0">
        Latest {list.length} conversations — check where the AI answers well or
        struggles.
      </p>

      {list.length === 0 ? (
        <div className="wp-panel p-8 text-center text-sm text-zinc-400">
          No conversations yet. Once the AI Assistant is ON and users start
          chatting, logs appear here.
        </div>
      ) : (
        list.map((c) => (
          <details key={c.id} className="wp-panel overflow-hidden">
            <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-4">
              <i className="fa-solid fa-comments text-brand-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-800">
                {c.first_message || "(empty)"}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500">
                {c.messages.length} msgs
              </span>
              <span className="hidden font-mono text-[11px] text-zinc-400 sm:block">
                {c.session_id.slice(0, 8)}
              </span>
              <span className="text-[11px] text-zinc-400">
                {new Date(c.updated_at).toLocaleString()}
              </span>
            </summary>
            <div className="space-y-2 border-t border-zinc-100 bg-zinc-50/70 p-4">
              {c.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-brand-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-700",
                  )}
                >
                  {m.content.length > 600 ? `${m.content.slice(0, 600)}…` : m.content}
                  {m.role === "assistant" && m.feedback && (
                    <span
                      className={cn(
                        "ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold",
                        m.feedback === "up"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-500",
                      )}
                    >
                      {m.feedback === "up" ? "👍 Helpful" : "👎 Not helpful"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </details>
        ))
      )}
    </div>
  );
}
