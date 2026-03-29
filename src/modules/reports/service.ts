import { ServiceLinkStatus } from '@prisma/client';
import { AiOrchestrator } from '@/lib/ai/orchestrator';
import { prisma } from '@/lib/db/prisma';

const orchestrator = new AiOrchestrator();

export async function generateReportForServiceLink(serviceLinkId: bigint): Promise<void> {
  const steps = await prisma.stepResponse.findMany({ where: { serviceLinkId }, orderBy: { stepIndex: 'asc' } });

  const synthesis = await orchestrator.run({
    stage: 'synthesis',
    model: process.env.AI_MODEL ?? 'gpt-4.1-mini',
    promptSnapshot: { stage: 'synthesis' },
    input: { steps }
  });

  await prisma.$transaction(async (tx) => {
    const report = await tx.report.create({
      data: {
        serviceLinkId,
        summaryMd: String(synthesis.output.summary ?? ''),
        reportMd: JSON.stringify(synthesis.output, null, 2),
        reportJsonb: synthesis.output as object
      }
    });

    await tx.serviceLink.update({
      where: { id: serviceLinkId },
      data: {
        status: ServiceLinkStatus.completed,
        completedAt: new Date(),
        reportId: report.id
      }
    });

    await tx.linkEvent.create({
      data: {
        serviceLinkId,
        eventType: 'report_completed',
        eventDataJsonb: { reportId: report.id.toString() }
      }
    });
  });
}
