import { prisma } from '@/lib/db/client';

export async function runExportPdf(reportId: bigint): Promise<void> {
  const report = await prisma.report.findUniqueOrThrow({ where: { id: reportId } });

  // TODO: integrate actual PDF renderer + object storage upload.
  const fakeObjectKey = `reports/${report.serviceLinkId.toString()}/${report.id.toString()}.pdf`;

  await prisma.report.update({
    where: { id: reportId },
    data: { pdfObjectKey: fakeObjectKey },
  });
}
