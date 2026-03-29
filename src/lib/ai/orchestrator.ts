export type AiStage = 'clarify' | 'followup' | 'synthesis' | 'report_summary' | 'report_full';

export interface AiRunInput {
  stage: AiStage;
  model: string;
  promptSnapshot: Record<string, unknown>;
  input: Record<string, unknown>;
}

export interface AiRunOutput {
  output: Record<string, unknown>;
  usage?: Record<string, unknown>;
}

export class AiOrchestrator {
  async run(input: AiRunInput): Promise<AiRunOutput> {
    // MVP: 这里先返回结构占位，接入真实模型时替换。
    return {
      output: {
        stage: input.stage,
        summary: 'stub summary',
        key_findings: [],
        risks: [],
        recommendations: [],
        confidence: 0.5
      },
      usage: { prompt_tokens: 0, completion_tokens: 0 }
    };
  }
}
