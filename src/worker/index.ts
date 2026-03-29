import IORedis from 'ioredis';
import { Worker } from 'bullmq';
import { generateReportForServiceLink } from '@/modules/reports/service';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

new Worker(
  'generate_report',
  async (job) => {
    const serviceLinkId = BigInt(job.data.serviceLinkId as string);
    await generateReportForServiceLink(serviceLinkId);
  },
  { connection }
);

console.log('Worker started: generate_report');
