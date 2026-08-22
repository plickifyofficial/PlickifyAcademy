import { getSiteContent } from "@/lib/site-content";

export const AI_ASSISTANT_KEY = "global.ai_assistant";

export type AiSources = {
  courses: boolean;
  lessons: boolean;
  batches: boolean;
  products: boolean;
  blog: boolean;
  faq: boolean;
  pages: boolean;
  policies: boolean;
  studentContext: boolean;
};

export type AiAssistantSettings = {
  is_enabled: boolean;
  name: string;
  welcomeMessage: string;
  systemInstruction: string;
  tone: "friendly" | "professional" | "playful";
  answerLength: "short" | "medium";
  suggestedQuestions: string[];
  sources: AiSources;
};

export const aiAssistantDefaults: AiAssistantSettings = {
  is_enabled: false,
  name: "Plickify AI Assistant",
  welcomeMessage:
    "হ্যালো! 👋\nআমি Plickify Academy-এর AI Assistant। কোর্স, ব্যাচ, ডিজিটাল প্রোডাক্ট ও শেখার বিষয়ে আপনাকে সাহায্য করতে পারি।",
  systemInstruction: "",
  tone: "friendly",
  answerLength: "medium",
  suggestedQuestions: [
    "AI Income Mastery কোর্সটি কী কী শেখায়?",
    "কোন course টা আমার জন্য ভালো হবে?",
    "Live Batch কবে শুরু হবে?",
    "Digital Products-এ কী কী পাওয়া যায়?",
    "আমি কীভাবে enroll করব?",
  ],
  sources: {
    courses: true,
    lessons: true,
    batches: true,
    products: true,
    blog: true,
    faq: true,
    pages: true,
    policies: true,
    studentContext: true,
  },
};

export async function getAiAssistantSettings(): Promise<AiAssistantSettings> {
  return getSiteContent(AI_ASSISTANT_KEY, aiAssistantDefaults);
}
