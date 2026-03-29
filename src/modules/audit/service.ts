import { prisma } from '@/lib/db/prisma';

export async function writeAuditLog(params: {
  actorType: string;
  actorId?: bigint;
  entityType: string;
  entityId: bigint;
  action: string;
  before?: unknown;
  after?: unknown;
  meta?: unknown;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorType: params.actorType,
      actorId: params.actorId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      beforeJsonb: params.before as object | undefined,
      afterJsonb: params.after as object | undefined,
      metaJsonb: params.meta as object | undefined
    }
  });
}
