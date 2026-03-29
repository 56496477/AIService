import { NextRequest, NextResponse } from 'next/server';
import { activateLinkByToken } from '@/modules/flow-runtime/service';

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await activateLinkByToken(token);
  if (!result.valid) return NextResponse.json(result, { status: 400 });

  return NextResponse.json({
    valid: true,
    serviceLinkId: result.link.id.toString(),
    sessionId: result.sessionId,
    sessionKey: result.sessionKey,
    scenarioTitle: result.link.scenarioVersion.title,
    status: result.link.status
  });
}
