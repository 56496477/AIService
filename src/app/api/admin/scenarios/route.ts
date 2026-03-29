import { NextRequest, NextResponse } from 'next/server';
import { requireAdminContext } from '@/lib/auth/admin-auth';
import { assertPermission } from '@/lib/rbac/permissions';
import { createScenario, listScenarios } from '@/modules/scenarios/service';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'scenario.read');
    const scenarios = await listScenarios();
    return NextResponse.json({ items: scenarios });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'scenario.write');
    const body = await req.json();

    const created = await createScenario({
      code: body.code,
      name: body.name,
      description: body.description,
      riskLevel: body.riskLevel,
      createdBy: admin.adminUserId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
