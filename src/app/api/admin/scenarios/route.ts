import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { scenarioTemplateSchema } from '@/lib/validators/scenario';

export async function GET() {
  const scenarios = await prisma.scenarioTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { versions: { orderBy: { versionNo: 'desc' }, take: 1 } }
  });
  return NextResponse.json({ data: scenarios });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = scenarioTemplateSchema.parse(body);

  const created = await prisma.scenarioTemplate.create({
    data: {
      code: parsed.code,
      name: parsed.name,
      description: parsed.description,
      riskLevel: parsed.riskLevel
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
