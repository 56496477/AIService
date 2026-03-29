import { ScenarioVersionStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function publishScenarioVersion(versionId: bigint, actorId?: bigint) {
  const version = await prisma.scenarioVersion.findUnique({ where: { id: versionId } });
  if (!version) throw new Error('Scenario version not found');
  if (version.status !== ScenarioVersionStatus.draft) throw new Error('Only draft can be published');

  return prisma.scenarioVersion.update({
    where: { id: versionId },
    data: {
      status: ScenarioVersionStatus.published,
      publishedAt: new Date(),
      publishedById: actorId
    }
  });
}
