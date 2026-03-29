import { NextRequest, NextResponse } from 'next/server';
import { saveStepResponse } from '@/modules/flow-runtime/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string; stepKey: string }> },
) {
  try {
    const body = await req.json();
    const { sessionId, stepKey } = await params;

    const saved = await saveStepResponse({
      serviceLinkId: BigInt(body.serviceLinkId),
      sessionId: BigInt(sessionId),
      stepKey,
      stepIndex: body.stepIndex,
      questionSnapshot: body.questionSnapshot,
      answerRaw: body.answerRaw,
      answerStructured: body.answerStructured,
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
