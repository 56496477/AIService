import { NextRequest, NextResponse } from 'next/server';
import { requireAdminContext } from '@/lib/auth/admin-auth';
import { assertPermission } from '@/lib/rbac/permissions';
import { revokeServiceLink } from '@/modules/links/service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'link.revoke');
    const { id } = await params;
    const revoked = await revokeServiceLink(BigInt(id), admin.adminUserId);
    return NextResponse.json(revoked);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
