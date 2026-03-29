import { createHash, randomBytes } from 'node:crypto';
import { FlowSessionStatus, ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export async function activateLinkByToken(token: string) {
  const tokenHash = hash(token);
  const link = await prisma.serviceLink.findUnique({ where: { tokenHash }, include: { scenarioVersion: true } });
  if (!link) return { valid: false as const, reason: 'invalid' as const };

  if (link.status === ServiceLinkStatus.revoked || link.status === ServiceLinkStatus.expired || link.status === ServiceLinkStatus.completed) {
    return { valid: false as const, reason: 'unavailable' as const };
  }

  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return { valid: false as const, reason: 'expired' as const };
  }

  const sessionKey = randomBytes(24).toString('hex');
  const session = await prisma.flowSession.create({
    data: {
      serviceLinkId: link.id,
      sessionKeyHash: hash(sessionKey),
      status: FlowSessionStatus.active
    }
  });

  await prisma.serviceLink.update({
    where: { id: link.id },
    data: { status: ServiceLinkStatus.opened, openedAt: new Date(), lastActiveAt: new Date() }
  });

  return { valid: true as const, link, sessionId: session.id.toString(), sessionKey };
}
