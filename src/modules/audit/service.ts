import { Prisma } from '@prisma/client';

export async function createAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    actorType: string;
    actorId?: bigint;
    entityType: string;
    entityId: bigint;
    action: string;
    before?: unknown;
    after?: unknown;
    meta?: unknown;
  },
) {
  await tx.auditLog.create({
    data: {
      actorType: params.actorType,
      actorId: params.actorId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      beforeJsonb: params.before as Prisma.InputJsonValue | undefined,
      afterJsonb: params.after as Prisma.InputJsonValue | undefined,
      metaJsonb: params.meta as Prisma.InputJsonValue | undefined,
    },
  });
}
