import { NextRequest, NextResponse } from 'next/server';
import { requireAdminContext } from '@/lib/auth/admin-auth';
import { assertPermission } from '@/lib/rbac/permissions';
import { publishScenarioVersion } from '@/modules/scenarios/service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'scenario.publish');
    const { id } = await params;
    const version = await publishScenarioVersion(BigInt(id), admin.adminUserId);
    return NextResponse.json(version);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
