import { NextRequest, NextResponse } from 'next/server';
import { FlowSessionStatus, ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { enqueueGenerateReport } from '@/lib/queue';

export async function POST(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const id = BigInt(sessionId);

  const session = await prisma.flowSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.flowSession.update({
      where: { id },
      data: { status: FlowSessionStatus.submitted, submittedAt: new Date() }
    });

    await tx.serviceLink.update({
      where: { id: session.serviceLinkId },
      data: { status: ServiceLinkStatus.submitted, submittedAt: new Date() }
    });

    await tx.linkEvent.create({
      data: {
        serviceLinkId: session.serviceLinkId,
        eventType: 'submitted',
        eventDataJsonb: { sessionId }
      }
    });
  });

  await enqueueGenerateReport(session.serviceLinkId);

  return NextResponse.json({ ok: true });
}
