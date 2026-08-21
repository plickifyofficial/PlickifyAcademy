import { AiSettingsForm } from "@/components/admin/ai-settings-form";
import { getAiAssistantSettings } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

export default async function AiSettingsPage() {
  const settings = await getAiAssistantSettings();
  return <AiSettingsForm initial={settings} />;
}
