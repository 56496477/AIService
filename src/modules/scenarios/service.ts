import { Prisma, ScenarioVersionStatus } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { validateCompiledRuntime } from '@/lib/validators/scenario-runtime';
import { createAuditLog } from '@/modules/audit/service';

export async function listScenarios() {
  return prisma.scenarioTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { versions: { orderBy: { versionNo: 'desc' }, take: 1 } },
  });
}

export async function createScenario(input: {
  code: string;
  name: string;
  description?: string;
  riskLevel?: string;
  createdBy?: bigint;
}) {
  return prisma.scenarioTemplate.create({
    data: {
      code: input.code,
      name: input.name,
      description: input.description,
      riskLevel: input.riskLevel ?? 'low',
      createdById: input.createdBy,
    },
  });
}

export async function createScenarioVersion(input: {
  scenarioTemplateId: bigint;
  title: string;
  description?: string;
  compiledRuntimeJsonb: unknown;
  createdBy?: bigint;
}) {
  validateCompiledRuntime(input.compiledRuntimeJsonb);

  const last = await prisma.scenarioVersion.findFirst({
    where: { scenarioTemplateId: input.scenarioTemplateId },
    orderBy: { versionNo: 'desc' },
  });

  return prisma.scenarioVersion.create({
    data: {
      scenarioTemplateId: input.scenarioTemplateId,
      versionNo: (last?.versionNo ?? 0) + 1,
      title: input.title,
      description: input.description,
      compiledRuntimeJsonb: input.compiledRuntimeJsonb as Prisma.InputJsonValue,
      createdById: input.createdBy,
    },
  });
}

export async function publishScenarioVersion(id: bigint, adminUserId: bigint) {
  return prisma.$transaction(async (tx) => {
    const version = await tx.scenarioVersion.findUniqueOrThrow({ where: { id } });
    if (version.status !== ScenarioVersionStatus.draft) {
      throw new Error('ONLY_DRAFT_CAN_BE_PUBLISHED');
    }

    const updated = await tx.scenarioVersion.update({
      where: { id },
      data: {
        status: ScenarioVersionStatus.published,
        publishedById: adminUserId,
        publishedAt: new Date(),
      },
    });

    await createAuditLog(tx, {
      actorType: 'admin',
      actorId: adminUserId,
      entityType: 'scenario_version',
      entityId: id,
      action: 'publish',
      before: version,
      after: updated,
    });

    return updated;
  });
}
