import { KnowledgePanel } from "@/components/admin/knowledge-panel";
import { getKnowledgeStats } from "@/lib/ai/knowledge";

export const dynamic = "force-dynamic";

export default async function AiKnowledgePage() {
  const stats = await getKnowledgeStats();
  return <KnowledgePanel initial={stats} />;
}
