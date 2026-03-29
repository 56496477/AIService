import { NextResponse } from 'next/server';
import { submitSession } from '@/modules/flow-runtime/service';

export async function POST(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const result = await submitSession(BigInt(sessionId));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
