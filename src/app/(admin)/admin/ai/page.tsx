import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAiAssistantSettings } from "@/lib/ai/config";
import { getAiStatus } from "@/lib/ai/provider";
import { getKnowledgeStats } from "@/lib/ai/knowledge";

export const dynamic = "force-dynamic";

export default async function AiOverviewPage() {
  const [settings, provider, stats] = await Promise.all([
    getAiAssistantSettings(),
    getAiStatus(),
    getKnowledgeStats(),
  ]);

  const admin = createAdminClient();
  const [{ count: convCount }, { count: msgCount }, { data: feedback }] =
    await Promise.all([
      admin.from("ai_conversations").select("id", { count: "exact", head: true }),
      admin.from("ai_messages").select("id", { count: "exact", head: true }),
      admin.from("ai_messages").select("feedback").not("feedback", "is", null).limit(5000),
    ]);
  const up = (feedback ?? []).filter((f) => f.feedback === "up").length;
  const down = (feedback ?? []).filter((f) => f.feedback === "down").length;

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="wp-panel !p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            AI Status
          </p>
          {settings.is_enabled ? (
            <p className="mt-2 flex items-center gap-2 text-lg font-extrabold text-emerald-600">
              <i className="fa-solid fa-circle-check" /> ON
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-lg font-extrabold text-zinc-400">
              <i className="fa-solid fa-circle-pause" /> OFF
            </p>
          )}
          <Link
            href="/admin/ai/settings"
            className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
          >
            Change →
          </Link>
        </div>

        <div className="wp-panel !p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            AI Provider
          </p>
          {provider.configured ? (
            <>
              <p className="mt-2 flex items-center gap-2 text-lg font-extrabold text-emerald-600">
                <i className="fa-solid fa-plug-circle-check" /> Connected
              </p>
              <p className="mt-1 truncate font-mono text-[11px] text-zinc-400">
                {provider.model}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 flex items-center gap-2 text-lg font-extrabold text-amber-500">
                <i className="fa-solid fa-triangle-exclamation" /> No API Key
              </p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                Set AI_API_KEY env var on the server.
              </p>
            </>
          )}
        </div>

        <div className="wp-panel !p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            Knowledge Chunks
          </p>
          <p className="mt-2 text-lg font-extrabold text-zinc-800">{stats.total}</p>
          <p className="mt-1 text-[11px] text-zinc-400">
            {stats.syncedAt
              ? `Synced ${new Date(stats.syncedAt).toLocaleString()}`
              : "Never synced"}
          </p>
        </div>

        <div className="wp-panel !p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            Conversations
          </p>
          <p className="mt-2 text-lg font-extrabold text-zinc-800">{convCount ?? 0}</p>
          <p className="mt-1 text-[11px] text-zinc-400">{msgCount ?? 0} messages total</p>
        </div>
      </div>

      {/* Feedback summary */}
      <div className="wp-panel p-5">
        <h2 className="text-base font-bold text-zinc-900">Answer Feedback</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          👍 Helpful vs 👎 Not helpful — given by users inside the chat widget.
        </p>
        <div className="mt-4 flex items-center gap-8">
          <div>
            <p className="text-2xl font-extrabold text-emerald-600">{up}</p>
            <p className="text-xs font-semibold text-zinc-500">Helpful</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-500">{down}</p>
            <p className="text-xs font-semibold text-zinc-500">Not helpful</p>
          </div>
          {up + down > 0 && (
            <div className="flex-1">
              <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.round((up / (up + down)) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                {Math.round((up / (up + down)) * 100)}% positive
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="wp-panel p-5">
        <h2 className="text-base font-bold text-zinc-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/ai/settings" className="wp-btn wp-btn-primary">
            <i className="fa-solid fa-sliders" /> Assistant Settings
          </Link>
          <Link href="/admin/ai/knowledge" className="wp-btn">
            <i className="fa-solid fa-database" /> Knowledge Base
          </Link>
          <Link href="/admin/ai/logs" className="wp-btn">
            <i className="fa-solid fa-comments" /> Conversation Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
