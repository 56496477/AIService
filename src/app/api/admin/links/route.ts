import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { createServiceLink } from '@/modules/links/service';

const createLinkSchema = z.object({
  scenarioTemplateId: z.coerce.bigint(),
  scenarioVersionId: z.coerce.bigint(),
  expiresAt: z.string().datetime().optional(),
  externalPlatform: z.string().optional(),
  externalOrderNo: z.string().optional(),
  externalBuyerRef: z.string().optional(),
  recipientName: z.string().optional(),
  recipientContact: z.string().optional(),
  internalNote: z.string().optional()
});

export async function GET() {
  const links = await prisma.serviceLink.findMany({
    orderBy: { createdAt: 'desc' },
    include: { scenarioTemplate: true, scenarioVersion: true }
  });
  return NextResponse.json({ data: links });
}

export async function POST(req: NextRequest) {
  const body = createLinkSchema.parse(await req.json());
  const { link, token } = await createServiceLink({
    ...body,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined
  });

  return NextResponse.json(
    {
      data: link,
      oneTimeToken: token,
      url: `${process.env.PUBLIC_APP_URL ?? 'http://localhost:3000'}/flow/${token}`
    },
    { status: 201 }
  );
}
