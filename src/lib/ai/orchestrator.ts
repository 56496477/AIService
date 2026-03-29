export type AiStage = 'clarify' | 'followup' | 'synthesis' | 'report_summary' | 'report_full';

export type AiRunResult = {
  output: Record<string, unknown>;
  usage?: Record<string, unknown>;
  latencyMs: number;
};

/**
 * Stub orchestrator for MVP scaffolding. Replace with real model provider integration.
 */
export class AiOrchestrator {
  async run(stage: AiStage, input: Record<string, unknown>): Promise<AiRunResult> {
    const start = Date.now();

    const output = {
      stage,
      summary: `Auto-generated ${stage} summary`,
      key_findings: [],
      risks: [],
      recommendations: [],
      confidence: 0.66,
      inputEcho: input,
    };

    return {
      output,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      latencyMs: Date.now() - start,
    };
  }
}
