"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin";
import { saveSectionContent } from "@/lib/actions/content";
import { AI_ASSISTANT_KEY, aiAssistantDefaults, type AiAssistantSettings } from "@/lib/ai/config";
import { syncKnowledgeBase } from "@/lib/ai/knowledge";

export async function saveAiAssistantSettings(
  settings: Partial<AiAssistantSettings>,
) {
  await requireAdmin();

  const current = { ...aiAssistantDefaults };
  const clean: AiAssistantSettings = {
    is_enabled: !!settings.is_enabled,
    name: String(settings.name ?? current.name).trim().slice(0, 60) || current.name,
    welcomeMessage: String(settings.welcomeMessage ?? current.welcomeMessage).slice(0, 600),
    systemInstruction: String(settings.systemInstruction ?? "").slice(0, 4000),
    tone:
      settings.tone === "professional" || settings.tone === "playful"
        ? settings.tone
        : "friendly",
    answerLength: settings.answerLength === "short" ? "short" : "medium",
    suggestedQuestions: (Array.isArray(settings.suggestedQuestions)
      ? settings.suggestedQuestions
      : current.suggestedQuestions
    )
      .map((q) => String(q).trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 8),
    sources: {
      courses: settings.sources?.courses !== false,
      lessons: settings.sources?.lessons !== false,
      batches: settings.sources?.batches !== false,
      products: settings.sources?.products !== false,
      blog: settings.sources?.blog !== false,
      faq: settings.sources?.faq !== false,
      pages: settings.sources?.pages !== false,
      policies: settings.sources?.policies !== false,
      studentContext: settings.sources?.studentContext !== false,
    },
  };

  await saveSectionContent(AI_ASSISTANT_KEY, clean);
  revalidatePath("/admin/ai");
}

export async function syncKnowledgeBaseAction() {
  await requireAdmin();
  const { getAiAssistantSettings } = await import("@/lib/ai/config");
  const settings = await getAiAssistantSettings();
  const result = await syncKnowledgeBase(settings.sources);
  revalidatePath("/admin/ai/knowledge");
  return result;
}

export async function rateAiMessage(messageId: string, feedback: "up" | "down") {
  if (!messageId || (feedback !== "up" && feedback !== "down")) return;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  // RLS restricts updates to the conversation owner.
  await supabase
    .from("ai_messages")
    .update({ feedback })
    .eq("id", messageId);
}

export async function saveAiProviderConfig(input: {
  providerLabel?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}) {
  await requireAdmin();

  const admin = (await import("@/lib/supabase/admin")).createAdminClient();
  const { data: existing } = await admin
    .from("ai_provider_config")
    .select("api_key")
    .eq("id", 1)
    .maybeSingle();

  // Blank key = keep the saved one (key is write-only from the UI).
  const apiKey =
    input.apiKey && input.apiKey.trim()
      ? input.apiKey.trim().slice(0, 300)
      : existing?.api_key || "";

  const { error } = await admin.from("ai_provider_config").upsert(
    {
      id: 1,
      provider_label:
        input.providerLabel?.trim().slice(0, 60) || "Mistral AI",
      api_key: apiKey,
      model: input.model?.trim().slice(0, 100) || "",
      base_url: input.baseUrl?.trim().slice(0, 200) || "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/admin/ai");
  revalidatePath("/admin/ai/settings");
}

export async function testAiProviderConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  await requireAdmin();

  const { getAiProviderConfig } = await import("@/lib/ai/provider");
  const cfg = await getAiProviderConfig();
  if (!cfg.apiKey) {
    return { ok: false, message: "No API key saved yet." };
  }
  if (!cfg.model) {
    return { ok: false, message: "Model name is empty — e.g. mistral-small-latest" };
  }

  try {
    const { aiChatComplete } = await import("@/lib/ai/provider");
    const reply = await aiChatComplete(
      [{ role: "user", content: "Reply with exactly one word: OK" }],
      { maxTokens: 10 },
    );
    return { ok: true, message: `Connected! Model replied: "${reply.slice(0, 40)}"` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Connection failed",
    };
  }
}
