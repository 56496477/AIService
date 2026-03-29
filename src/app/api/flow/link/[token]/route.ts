import { NextRequest, NextResponse } from 'next/server';
import { activateByToken } from '@/modules/flow-runtime/service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await activateByToken(
    token,
    req.headers.get('x-forwarded-for') || undefined,
    req.headers.get('user-agent') || undefined,
  );

  if (!result.valid) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
