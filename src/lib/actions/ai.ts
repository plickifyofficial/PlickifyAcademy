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
