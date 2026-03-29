import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdminContext } from '@/lib/auth/admin-auth';
import { assertPermission } from '@/lib/rbac/permissions';
import { createScenarioVersion } from '@/modules/scenarios/service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'scenario.read');
    const { id } = await params;

    const versions = await prisma.scenarioVersion.findMany({
      where: { scenarioTemplateId: BigInt(id) },
      orderBy: { versionNo: 'desc' },
    });

    return NextResponse.json({ items: versions });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'scenario.write');
    const body = await req.json();
    const { id } = await params;

    const created = await createScenarioVersion({
      scenarioTemplateId: BigInt(id),
      title: body.title,
      description: body.description,
      compiledRuntimeJsonb: body.compiledRuntimeJsonb,
      createdBy: admin.adminUserId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
