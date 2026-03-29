import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import { writeAuditLog } from '@/modules/audit/service';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateToken(): string {
  return randomBytes(24).toString('hex');
}

export async function createServiceLink(input: {
  scenarioTemplateId: bigint;
  scenarioVersionId: bigint;
  expiresAt?: Date;
  externalPlatform?: string;
  externalOrderNo?: string;
  externalBuyerRef?: string;
  recipientName?: string;
  recipientContact?: string;
  internalNote?: string;
  createdById?: bigint;
}) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const linkCode = randomBytes(8).toString('hex');

  const result = await prisma.$transaction(async (tx) => {
    const link = await tx.serviceLink.create({
      data: {
        linkCode,
        tokenHash,
        scenarioTemplateId: input.scenarioTemplateId,
        scenarioVersionId: input.scenarioVersionId,
        expiresAt: input.expiresAt,
        externalPlatform: input.externalPlatform,
        externalOrderNo: input.externalOrderNo,
        externalBuyerRef: input.externalBuyerRef,
        recipientName: input.recipientName,
        recipientContact: input.recipientContact,
        internalNote: input.internalNote,
        createdById: input.createdById
      }
    });

    await tx.linkEvent.create({
      data: {
        serviceLinkId: link.id,
        eventType: 'created',
        eventDataJsonb: { source: 'admin' }
      }
    });

    await writeAuditLog({
      actorType: 'admin',
      actorId: input.createdById,
      entityType: 'service_link',
      entityId: link.id,
      action: 'create',
      after: link
    });

    return link;
  });

  return { link: result, token };
}
