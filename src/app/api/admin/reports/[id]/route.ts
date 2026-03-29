import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdminContext } from '@/lib/auth/admin-auth';
import { assertPermission } from '@/lib/rbac/permissions';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = requireAdminContext(req);
    assertPermission(admin.roles, 'report.read');
    const { id } = await params;

    const report = await prisma.report.findUniqueOrThrow({ where: { id: BigInt(id) } });
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
