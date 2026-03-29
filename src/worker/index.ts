import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { runGenerateReport } from '@/worker/jobs/generate-report';
import { runExportPdf } from '@/worker/jobs/export-pdf';
import { runExpireLinks } from '@/worker/jobs/expire-links';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

new Worker(
  'generate_report',
  async (job) => {
    await runGenerateReport(BigInt(job.data.serviceLinkId));
  },
  { connection },
);

new Worker(
  'export_pdf',
  async (job) => {
    await runExportPdf(BigInt(job.data.reportId));
  },
  { connection },
);

setInterval(async () => {
  const total = await runExpireLinks();
  if (total > 0) {
    // eslint-disable-next-line no-console
    console.log(`[expire_links] expired ${total} links`);
  }
}, 60_000);

// eslint-disable-next-line no-console
console.log('Worker started');
