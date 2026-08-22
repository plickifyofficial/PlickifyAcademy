import { AiSettingsForm } from "@/components/admin/ai-settings-form";
import { AiProviderForm } from "@/components/admin/ai-provider-form";
import { getAiAssistantSettings } from "@/lib/ai/config";
import { getAiStatus } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

export default async function AiSettingsPage() {
  const [settings, status] = await Promise.all([
    getAiAssistantSettings(),
    getAiStatus(),
  ]);

  return (
    <div className="space-y-6">
      <AiProviderForm initial={status} />
      <AiSettingsForm initial={settings} />
    </div>
  );
}
