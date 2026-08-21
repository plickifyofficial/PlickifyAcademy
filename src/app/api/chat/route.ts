import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAiAssistantSettings } from "@/lib/ai/config";
import { aiChatComplete, isAiConfigured, type ChatMessage } from "@/lib/ai/provider";
import {
  ensureKnowledgeFresh,
  retrieveKnowledge,
  type RetrievedChunk,
} from "@/lib/ai/knowledge";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HISTORY_LIMIT = 10;

function buildKnowledgeBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  const lines: string[] = ["", "KNOWLEDGE BASE (verified Plickify Academy data):"];
  chunks.forEach((c, i) => {
    const label = c.source_type.toUpperCase();
    const link = c.url ? `\nLink: ${c.url}` : "";
    lines.push(
      `[${i + 1}] (${label}) ${c.title}${c.subtitle ? ` — ${c.subtitle}` : ""}\n${c.body.trim()}${link}`,
    );
    lines.push("");
  });
  return lines.join("\n");
}

function buildSystemPrompt(opts: {
  name: string;
  tone: string;
  answerLength: string;
  extraInstruction: string;
  knowledgeBlock: string;
  studentBlock: string;
}): string {
  const lengthRule =
    opts.answerLength === "short"
      ? "Keep answers under ~80 words unless the user asks for details."
      : "Keep answers concise (under ~150 words) unless the user asks for details.";

  return [
    `You are "${opts.name}", the official AI assistant of Plickify Academy — an online learning platform for AI, Freelancing and Digital Skills.`,
    "",
    "STRICT GROUNDING RULES (highest priority):",
    "1. For any question related to Plickify Academy (courses, prices, batches, schedules, digital products, policies, enrollment, instructors, blog), you MUST answer ONLY from the KNOWLEDGE BASE below.",
    "2. NEVER invent or guess course prices, discounts, batch dates or schedules, instructor names, policy details, seat availability, or anything not present in the knowledge base.",
    "3. If the required information is NOT in the knowledge base, clearly say that this information is currently unavailable (in the user's language) and suggest visiting the relevant page or contacting support. Do not apologize excessively.",
    "4. Only recommend courses/products/batches that exist in the knowledge base. When you mention one, include its Link as a markdown link like [View Course](/courses/slug).",
    "5. Never reveal any private student information other than the STUDENT CONTEXT given to you for this conversation. That context is confidential to this user only.",
    "6. General-knowledge questions (not about Plickify Academy) may be answered from your general knowledge — briefly and helpfully. Plickify-related context always takes priority.",
    "",
    "STYLE:",
    `- Tone: ${opts.tone}. ${lengthRule}`,
    "- Reply in the SAME language/script the user writes in: Bangla → Bangla, Banglish → Banglish/Bangla, English → English.",
    "- Be helpful and action-oriented: when useful, end with one clear next step (e.g., a relevant page link).",
    "- Formatting: plain text with markdown links [text](url) and **bold** allowed. No headings, no code blocks.",
    opts.extraInstruction ? `\nADMIN INSTRUCTION:\n${opts.extraInstruction}` : "",
    opts.studentBlock,
    opts.knowledgeBlock,
  ]
    .filter(Boolean)
    .join("\n");
}

async function loadHistory(conversationId: string): Promise<ChatMessage[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);
  return ((data ?? []) as Array<{ role: string; content: string }>)
    .reverse()
    .map((m) => ({ role: m.role as ChatMessage["role"], content: m.content }));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sessionId?: string; message?: string };
    const message = (body.message ?? "").trim();
    const sessionId = (body.sessionId ?? "").slice(0, 64);
    if (!message || !sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const settings = await getAiAssistantSettings();
    if (!settings.is_enabled) {
      return NextResponse.json({ error: "AI assistant is disabled" }, { status: 403 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Student context (only what's permitted).
    let studentBlock = "";
    if (user && settings.sources.studentContext) {
      try {
        const [{ data: profile }, { data: enrollments }] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
          supabase
            .from("enrollments")
            .select("courses(title, slug)")
            .eq("user_id", user.id)
            .limit(20),
        ]);
        const names = (enrollments ?? [])
          .map((e) => (e.courses as unknown as { title: string } | null)?.title)
          .filter(Boolean);
        studentBlock =
          `\nSTUDENT CONTEXT (confidential — never share other users' data):\n` +
          `- Name: ${profile?.full_name || "Student"}\n` +
          `- Enrolled courses: ${names.length ? names.join(", ") : "none yet"}\n` +
          `If asked about their courses/progress, use ONLY this info.`;
      } catch {
        studentBlock = "";
      }
    }

    // Knowledge: auto-sync if content changed, then retrieve.
    await ensureKnowledgeFresh(settings.sources);
    const chunks = await retrieveKnowledge(message, 10);
    const knowledgeBlock = buildKnowledgeBlock(chunks);

    // Conversation memory.
    const admin = createAdminClient();
    let conversationId: string | null = null;
    const { data: existingConv } = await admin
      .from("ai_conversations")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (existingConv?.id) {
      conversationId = existingConv.id;
    } else {
      const { data: newConv } = await admin
        .from("ai_conversations")
        .insert({
          session_id: sessionId,
          user_id: user?.id ?? null,
          first_message: message.slice(0, 200),
          message_count: 0,
        })
        .select("id")
        .single();
      conversationId = newConv?.id ?? null;
    }

    const history = conversationId ? await loadHistory(conversationId) : [];

    if (!isAiConfigured()) {
      const fallback =
        "AI Assistant এখনো সম্পূর্ণভাবে চালু হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন, অথবা আমাদের Contact পেজে যোগাযোগ করুন।";
      return NextResponse.json({ reply: fallback });
    }

    const systemPrompt = buildSystemPrompt({
      name: settings.name,
      tone: settings.tone,
      answerLength: settings.answerLength,
      extraInstruction: settings.systemInstruction,
      knowledgeBlock,
      studentBlock,
    });

    const reply = await aiChatComplete(
      [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
      { temperature: settings.tone === "playful" ? 0.6 : 0.3 },
    );

    // Persist messages.
    let assistantMessageId: string | null = null;
    if (conversationId) {
      const now = new Date().toISOString();
      const { data: inserted } = await admin
        .from("ai_messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "user",
            content: message.slice(0, 4000),
            tokens_est: Math.ceil(message.length / 4),
          },
          {
            conversation_id: conversationId,
            role: "assistant",
            content: reply.slice(0, 6000),
            tokens_est: Math.ceil(reply.length / 4),
          },
        ])
        .select("id");
      assistantMessageId = inserted?.[1]?.id ?? null;
      await admin
        .from("ai_conversations")
        .update({
          updated_at: now,
          message_count: history.length + 2,
        })
        .eq("id", conversationId);
    }

    return NextResponse.json({ reply, messageId: assistantMessageId });
  } catch (err) {
    console.error("[ai-chat]", err);
    return NextResponse.json(
      {
        error:
          "দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।",
      },
      { status: 500 },
    );
  }
}
