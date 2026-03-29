import IORedis from 'ioredis';
import { Queue } from 'bullmq';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

export const reportQueue = new Queue('generate_report', { connection });
export const pdfQueue = new Queue('export_pdf', { connection });

export async function enqueueGenerateReport(serviceLinkId: bigint): Promise<void> {
  await reportQueue.add('generate_report', { serviceLinkId: serviceLinkId.toString() }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
}
