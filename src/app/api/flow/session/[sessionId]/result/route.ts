import { NextResponse } from 'next/server';
import { getLatestReportBySessionId } from '@/modules/reports/service';

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const report = await getLatestReportBySessionId(BigInt(sessionId));
    if (!report) return NextResponse.json({ status: 'generating' });
    return NextResponse.json({ status: 'completed', report });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
