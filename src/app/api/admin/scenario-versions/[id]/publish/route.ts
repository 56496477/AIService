import { NextRequest, NextResponse } from 'next/server';
import { publishScenarioVersion } from '@/modules/scenarios/service';

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updated = await publishScenarioVersion(BigInt(id));
  return NextResponse.json({ data: updated });
}
