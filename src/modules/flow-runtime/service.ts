import crypto from 'node:crypto';
import { FlowSessionStatus, ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { hashFlowToken } from '@/modules/links/service';
import { enqueueGenerateReport } from '@/lib/queue/queues';

function hashSessionToken(token: string) {
  return crypto
    .createHash('sha256')
    .update(`${token}:${process.env.SESSION_TOKEN_SALT ?? 'dev_session_salt'}`)
    .digest('hex');
}

function generateSessionToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export async function activateByToken(token: string, ipAddress?: string, userAgent?: string) {
  const tokenHash = hashFlowToken(token);
  const link = await prisma.serviceLink.findUnique({
    where: { tokenHash },
    include: { scenarioVersion: true, flowSessions: { where: { status: 'active' }, take: 1 } },
  });

  if (!link) return { valid: false as const, reason: 'NOT_FOUND' };
  if (link.status === ServiceLinkStatus.revoked) return { valid: false as const, reason: 'REVOKED' };
  if (link.status === ServiceLinkStatus.expired) return { valid: false as const, reason: 'EXPIRED' };
  if (link.status === ServiceLinkStatus.completed) return { valid: false as const, reason: 'COMPLETED' };
  if (link.expiresAt && link.expiresAt < new Date()) return { valid: false as const, reason: 'EXPIRED' };

  let session = link.flowSessions[0];
  let sessionToken: string | undefined;

  if (!session) {
    sessionToken = generateSessionToken();
    session = await prisma.flowSession.create({
      data: {
        serviceLinkId: link.id,
        sessionKeyHash: hashSessionToken(sessionToken),
        ipAddress,
        userAgent,
      },
    });
  }

  if (link.status === ServiceLinkStatus.created) {
    await prisma.serviceLink.update({
      where: { id: link.id },
      data: { status: ServiceLinkStatus.opened, openedAt: new Date(), lastActiveAt: new Date() },
    });
  }

  return {
    valid: true as const,
    serviceLinkId: link.id,
    sessionId: session.id,
    sessionToken,
    scenarioTitle: link.scenarioVersion.title,
    runtime: link.scenarioVersion.compiledRuntimeJsonb,
    status: link.status,
  };
}

export async function saveStepResponse(input: {
  serviceLinkId: bigint;
  sessionId: bigint;
  stepKey: string;
  stepIndex: number;
  questionSnapshot: unknown;
  answerRaw?: unknown;
  answerStructured?: unknown;
}) {
  const saved = await prisma.stepResponse.upsert({
    where: { flowSessionId_stepKey: { flowSessionId: input.sessionId, stepKey: input.stepKey } },
    create: {
      serviceLinkId: input.serviceLinkId,
      flowSessionId: input.sessionId,
      stepKey: input.stepKey,
      stepIndex: input.stepIndex,
      questionSnapshotJsonb: input.questionSnapshot as any,
      answerRawJsonb: input.answerRaw as any,
      answerStructuredJsonb: input.answerStructured as any,
    },
    update: {
      answerRawJsonb: input.answerRaw as any,
      answerStructuredJsonb: input.answerStructured as any,
      updatedAt: new Date(),
    },
  });

  await prisma.serviceLink.update({
    where: { id: input.serviceLinkId },
    data: { status: ServiceLinkStatus.in_progress, lastActiveAt: new Date(), currentStepKey: input.stepKey },
  });

  return saved;
}

export async function submitSession(sessionId: bigint) {
  const session = await prisma.flowSession.findUniqueOrThrow({ where: { id: sessionId } });

  if (session.status !== FlowSessionStatus.active) {
    throw new Error('SESSION_NOT_ACTIVE');
  }

  await prisma.$transaction(async (tx) => {
    await tx.flowSession.update({
      where: { id: sessionId },
      data: { status: FlowSessionStatus.submitted, submittedAt: new Date() },
    });

    await tx.serviceLink.update({
      where: { id: session.serviceLinkId },
      data: { status: ServiceLinkStatus.submitted, submittedAt: new Date() },
    });

    await tx.linkEvent.create({
      data: { serviceLinkId: session.serviceLinkId, eventType: 'submitted' },
    });
  });

  await enqueueGenerateReport(session.serviceLinkId);

  return { ok: true };
}
