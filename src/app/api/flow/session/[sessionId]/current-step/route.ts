import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = await prisma.flowSession.findUniqueOrThrow({ where: { id: BigInt(sessionId) } });
  const link = await prisma.serviceLink.findUniqueOrThrow({
    where: { id: session.serviceLinkId },
    include: { scenarioVersion: true },
  });

  const runtime = link.scenarioVersion.compiledRuntimeJsonb as any;
  const steps = runtime.steps || [];

  const currentKey = link.currentStepKey;
  const currentStep = currentKey ? steps.find((s: any) => s.key === currentKey) : steps[0];

  return NextResponse.json({
    sessionId,
    status: session.status,
    currentStep,
    totalSteps: steps.length,
  });
}
