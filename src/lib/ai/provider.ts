/**
 * Provider-independent AI adapter (OpenAI-compatible chat completions API).
 * Works with OpenAI, Groq, OpenRouter, Together, DeepSeek, local LLMs, etc.
 * Configure via env: AI_API_KEY, AI_MODEL, AI_BASE_URL, AI_PROVIDER.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

export async function aiChatComplete(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("AI_API_KEY is not configured");

  const baseUrl = (
    process.env.AI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/+$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";

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
