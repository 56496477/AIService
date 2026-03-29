import { ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function expireLinks(now = new Date()): Promise<number> {
  const result = await prisma.serviceLink.updateMany({
    where: {
      status: { in: [ServiceLinkStatus.created, ServiceLinkStatus.opened, ServiceLinkStatus.in_progress] },
      expiresAt: { lt: now }
    },
    data: { status: ServiceLinkStatus.expired, invalidatedAt: now }
  });

  return result.count;
}
