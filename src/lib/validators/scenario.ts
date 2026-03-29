import { z } from 'zod';

export const scenarioTemplateSchema = z.object({
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).default('low')
});

export const scenarioVersionSchema = z.object({
  scenarioTemplateId: z.coerce.bigint(),
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  compiledRuntimeJsonb: z.record(z.string(), z.unknown())
});
