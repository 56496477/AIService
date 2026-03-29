import { FlowSessionStatus, ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { AiOrchestrator } from '@/lib/ai/orchestrator';

const ai = new AiOrchestrator();

export async function runGenerateReport(serviceLinkId: bigint): Promise<void> {
  const link = await prisma.serviceLink.findUniqueOrThrow({
    where: { id: serviceLinkId },
    include: {
      scenarioVersion: true,
      flowSessions: { where: { status: 'submitted' }, orderBy: { submittedAt: 'desc' }, take: 1 },
      stepResponses: { orderBy: { stepIndex: 'asc' } },
      reports: { orderBy: { versionNo: 'desc' }, take: 1 },
    },
  });

  const session = link.flowSessions[0];
  if (!session) throw new Error('SUBMITTED_SESSION_NOT_FOUND');

  await prisma.serviceLink.update({
    where: { id: serviceLinkId },
    data: { status: ServiceLinkStatus.generating_report },
  });

  const context = {
    runtime: link.scenarioVersion.compiledRuntimeJsonb,
    steps: link.stepResponses.map((r) => ({
      stepKey: r.stepKey,
      question: r.questionSnapshotJsonb,
      answer: r.answerRawJsonb,
      structured: r.answerStructuredJsonb,
    })),
  };

  const clarify = await ai.run('clarify', context);
  const synthesis = await ai.run('synthesis', { ...context, clarify: clarify.output });
  const summary = await ai.run('report_summary', { ...context, synthesis: synthesis.output });
  const fullReport = await ai.run('report_full', { ...context, synthesis: synthesis.output });

  await prisma.$transaction(async (tx) => {
    for (const [stage, run] of Object.entries({ clarify, synthesis, report_summary: summary, report_full: fullReport })) {
      await tx.aiRun.create({
        data: {
          serviceLinkId,
          flowSessionId: session.id,
          stage,
          modelName: process.env.AI_MODEL_DEFAULT || 'gpt-4.1-mini',
          promptSnapshotJsonb: { stage, versionId: link.scenarioVersionId.toString() },
          inputJsonb: context,
          outputJsonb: run.output,
          usageJsonb: run.usage,
          latencyMs: run.latencyMs,
        },
      });
    }

    const versionNo = (link.reports[0]?.versionNo ?? 0) + 1;

    const report = await tx.report.create({
      data: {
        serviceLinkId,
        flowSessionId: session.id,
        versionNo,
        summaryMd: String((summary.output.summary as string) || ''),
        reportMd: String((fullReport.output.summary as string) || ''),
        reportJsonb: {
          summary: summary.output,
          full: fullReport.output,
          synthesis: synthesis.output,
        },
      },
    });

    await tx.serviceLink.update({
      where: { id: serviceLinkId },
      data: {
        status: ServiceLinkStatus.completed,
        completedAt: new Date(),
        reportId: report.id,
      },
    });

    await tx.flowSession.update({
      where: { id: session.id },
      data: { status: FlowSessionStatus.closed, closedAt: new Date() },
    });

    await tx.linkEvent.create({
      data: { serviceLinkId, eventType: 'completed', eventDataJsonb: { reportId: report.id.toString() } },
    });
  });
}
