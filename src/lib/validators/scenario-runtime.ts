import { z } from 'zod';

export const runtimeStepSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  component: z.string().min(1),
  required: z.boolean().default(true),
  validation: z.record(z.any()).optional(),
  ai: z.record(z.any()).optional(),
  next: z.record(z.any()).optional(),
  reportMapping: z.record(z.any()).optional(),
});

export const compiledRuntimeSchema = z.object({
  meta: z.object({
    sceneCode: z.string(),
    sceneName: z.string(),
    riskLevel: z.string(),
  }),
  steps: z.array(runtimeStepSchema).min(1),
  prompts: z.object({
    clarify: z.string(),
    followup: z.string(),
    synthesis: z.string(),
    reportSummary: z.string(),
    reportFull: z.string(),
  }),
  reportTemplate: z.object({
    sections: z.array(z.string()),
  }),
});

export function validateCompiledRuntime(input: unknown) {
  return compiledRuntimeSchema.parse(input);
}
