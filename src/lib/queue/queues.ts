import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const reportQueue = new Queue('generate_report', { connection });
export const exportPdfQueue = new Queue('export_pdf', { connection });

export async function enqueueGenerateReport(serviceLinkId: bigint): Promise<void> {
  await reportQueue.add('generate_report', { serviceLinkId: serviceLinkId.toString() }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2_000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  });
}
