import { prisma } from '@/lib/db/client';

export async function getLatestReportBySessionId(sessionId: bigint) {
  const session = await prisma.flowSession.findUniqueOrThrow({ where: { id: sessionId } });
  return prisma.report.findFirst({
    where: { serviceLinkId: session.serviceLinkId },
    orderBy: [{ versionNo: 'desc' }, { createdAt: 'desc' }],
  });
}
