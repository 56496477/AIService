import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const body = await req.json();

  const session = await prisma.flowSession.findUniqueOrThrow({ where: { id: BigInt(sessionId) } });
  const link = await prisma.serviceLink.findUniqueOrThrow({
    where: { id: session.serviceLinkId },
    include: { scenarioVersion: true },
  });

  await prisma.serviceLink.update({
    where: { id: link.id },
    data: { currentStepKey: body.nextStepKey, lastActiveAt: new Date() },
  });

  return NextResponse.json({ ok: true, nextStepKey: body.nextStepKey });
}
