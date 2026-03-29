import { ServiceLinkStatus } from '@prisma/client';
import { prisma } from '@/lib/db/client';

export async function runExpireLinks(): Promise<number> {
  const now = new Date();

  const links = await prisma.serviceLink.findMany({
    where: {
      expiresAt: { lt: now },
      status: { in: [ServiceLinkStatus.created, ServiceLinkStatus.opened, ServiceLinkStatus.in_progress] },
    },
    select: { id: true },
  });

  for (const link of links) {
    await prisma.$transaction(async (tx) => {
      await tx.serviceLink.update({ where: { id: link.id }, data: { status: ServiceLinkStatus.expired } });
      await tx.linkEvent.create({ data: { serviceLinkId: link.id, eventType: 'expired' } });
    });
  }

  return links.length;
}
