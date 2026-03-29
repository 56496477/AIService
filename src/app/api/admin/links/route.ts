import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdminContext } from '@/lib/auth/admin-auth';
import { assertPermission } from '@/lib/rbac/permissions';
import { createServiceLink } from '@/modules/links/service';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'link.read');

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const scenarioVersionId = searchParams.get('scenarioVersionId');
    const externalOrderNo = searchParams.get('externalOrderNo');

    const items = await prisma.serviceLink.findMany({
      where: {
        status: status ? (status as any) : undefined,
        scenarioVersionId: scenarioVersionId ? BigInt(scenarioVersionId) : undefined,
        externalOrderNo: externalOrderNo ?? undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        scenarioTemplate: true,
        scenarioVersion: true,
        reports: { orderBy: { versionNo: 'desc' }, take: 1 },
      },
      take: 100,
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'link.write');
    const body = await req.json();

    const { link, token } = await createServiceLink({
      scenarioTemplateId: BigInt(body.scenarioTemplateId),
      scenarioVersionId: BigInt(body.scenarioVersionId),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      externalPlatform: body.externalPlatform,
      externalOrderNo: body.externalOrderNo,
      externalBuyerRef: body.externalBuyerRef,
      recipientName: body.recipientName,
      recipientContact: body.recipientContact,
      internalNote: body.internalNote,
      createdBy: admin.adminUserId,
    });

    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

    return NextResponse.json(
      {
        link,
        flowUrl: `${baseUrl}/flow/${token}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
