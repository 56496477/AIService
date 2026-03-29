import crypto from 'node:crypto';
import { ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/client';
import { createAuditLog } from '@/modules/audit/service';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generatePlainToken() {
  return crypto.randomBytes(24).toString('base64url');
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
  createdBy?: bigint;
}) {
  const token = generatePlainToken();
  const linkCode = crypto.randomBytes(8).toString('hex');
  const tokenHash = sha256(`${token}:${process.env.FLOW_TOKEN_SALT ?? 'dev_salt'}`);

  const link = await prisma.$transaction(async (tx) => {
    const created = await tx.serviceLink.create({
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
        createdById: input.createdBy,
      },
    });

    await tx.linkEvent.create({
      data: {
        serviceLinkId: created.id,
        eventType: 'created',
        eventDataJsonb: { createdBy: input.createdBy?.toString() },
      },
    });

    await createAuditLog(tx, {
      actorType: 'admin',
      actorId: input.createdBy,
      entityType: 'service_link',
      entityId: created.id,
      action: 'create',
      after: created,
    });

    return created;
  });

  return {
    link,
    token,
  };
}

export function hashFlowToken(token: string): string {
  return sha256(`${token}:${process.env.FLOW_TOKEN_SALT ?? 'dev_salt'}`);
}

export async function revokeServiceLink(id: bigint, adminUserId: bigint) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.serviceLink.findUniqueOrThrow({ where: { id } });
    const updated = await tx.serviceLink.update({
      where: { id },
      data: {
        status: ServiceLinkStatus.revoked,
        invalidatedAt: new Date(),
      },
    });

    await tx.linkEvent.create({
      data: { serviceLinkId: id, eventType: 'revoked', eventDataJsonb: { adminUserId: adminUserId.toString() } },
    });

    await createAuditLog(tx, {
      actorType: 'admin',
      actorId: adminUserId,
      entityType: 'service_link',
      entityId: id,
      action: 'revoke',
      before,
      after: updated,
    });

    return updated;
  });
}
