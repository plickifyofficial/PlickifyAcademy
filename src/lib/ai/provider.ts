/**
 * Provider-independent AI adapter (OpenAI-compatible chat completions API).
 * Works with Mistral, OpenAI, Groq, OpenRouter, DeepSeek, local LLMs, etc.
 *
 * Configuration priority:
 *   1. Admin Panel (ai_provider_config table — admin-only RLS)
 *   2. Environment variables (AI_API_KEY, AI_MODEL, AI_BASE_URL, AI_PROVIDER)
 *
 * The API key never leaves the server; only a masked hint is exposed to admins.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AiProviderConfig = {
  providerLabel: string;
  apiKey: string;
  model: string;
  baseUrl: string;
};

const FALLBACK_BASE_URL = "https://api.mistral.ai/v1";
const FALLBACK_MODEL = "mistral-small-latest";

/** Server-only. Reads admin panel config first, then env fallbacks. */
export async function getAiProviderConfig(): Promise<AiProviderConfig> {
  let dbConfig: {
    provider_label?: string;
    api_key?: string;
    model?: string;
    base_url?: string;
  } | null = null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ai_provider_config")
      .select("provider_label, api_key, model, base_url")
      .eq("id", 1)
      .maybeSingle();
    dbConfig = data;
  } catch {
    // fall through to env
  }

  return {
    providerLabel:
      dbConfig?.provider_label || process.env.AI_PROVIDER || "openai-compatible",
    apiKey: dbConfig?.api_key || process.env.AI_API_KEY || "",
    model: dbConfig?.model || process.env.AI_MODEL || FALLBACK_MODEL,
    baseUrl: (
      dbConfig?.base_url ||
      process.env.AI_BASE_URL ||
      FALLBACK_BASE_URL
    ).replace(/\/+$/, ""),
  };
}

export type AiStatus = {
  configured: boolean;
  source: "panel" | "env" | "none";
  providerLabel: string;
  model: string;
  baseUrl: string;
  keyHint: string | null;
};

/** Safe-to-display status (masked key). */
export async function getAiStatus(): Promise<AiStatus> {
  let dbHasKey = false;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ai_provider_config")
      .select("api_key")
      .eq("id", 1)
      .maybeSingle();
    dbHasKey = Boolean(data?.api_key);
  } catch {
    dbHasKey = false;
  }

  const envKey = process.env.AI_API_KEY || "";
  const apiKey = dbHasKey ? (await readPanelKey()) : envKey;
  const cfg = await getAiProviderConfig();

  return {
    configured: Boolean(apiKey),
    source: dbHasKey ? "panel" : envKey ? "env" : "none",
    providerLabel: cfg.providerLabel,
    model: cfg.model,
    baseUrl: cfg.baseUrl,
    keyHint: apiKey ? `••••${apiKey.slice(-4)}` : null,
  };
}

async function readPanelKey(): Promise<string> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ai_provider_config")
      .select("api_key")
      .eq("id", 1)
      .maybeSingle();
    return data?.api_key || "";
  } catch {
    return "";
  }
}

export async function aiChatComplete(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const { apiKey, baseUrl, model } = await getAiProviderConfig();
  if (!apiKey) throw new Error("AI API key is not configured");

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 900,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `AI provider error ${res.status}: ${text.slice(0, 300) || res.statusText}`,
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from AI provider");
  return content;
}
