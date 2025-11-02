import { z } from "zod";
import { createToolCallAccuracyScorerCode } from "@mastra/evals/scorers/code";
import { createCompletenessScorer } from "@mastra/evals/scorers/code";
import { createScorer } from "@mastra/core/scores";

// ✅ Checks if the agent used the github tool correctly
export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: "githubRepoTool",
  strictMode: false,
});

// ✅ Generic completeness scorer (built-in)
export const completenessScorer = createCompletenessScorer();

// ✅ Our custom scorer: evaluates the portfolio content returned by the agent
export const portfolioQualityScorer = createScorer({
  name: "Portfolio Quality Score",
  description: "Evaluates if the generated portfolio contains key sections",
  type: "agent",
  judge: {
    model: "google/gemini-2.5-flash", // since you're using Gemini free tier
    instructions: `
      You are an expert portfolio evaluator.
      Score the AI's portfolio output based on structure and completeness.
      Required sections: Introduction, Skills/Tech stack, Projects, Contact info.
      Return ONLY valid JSON matching the schema.
    `,
  },
})
  .preprocess(({ run }) => {
    const assistantOutput = (run.output?.[0]?.content as string) || "";
    return { assistantOutput };
  })
  .analyze({
    description: "Detect if required sections exist",
    outputSchema: z.object({
      hasIntro: z.boolean(),
      hasProjects: z.boolean(),
      hasTechStack: z.boolean(),
      hasContact: z.boolean(),
      explanation: z.string().optional(),
    }),
    createPrompt: ({ results }) => `
      Evaluate this portfolio output:

      """
      ${results.preprocessStepResult.assistantOutput}
      """

      Does it contain:
      - An intro? (yes/no)
      - A project section? (yes/no)
      - A tech stack section? (yes/no)
      - Contact info? (yes/no)

      Return JSON like:
      {
        "hasIntro": true/false,
        "hasProjects": true/false,
        "hasTechStack": true/false,
        "hasContact": true/false,
        "explanation": "short explanation"
      }
    `,
  })
  .generateScore(({ results }) => {
    const r = results.analyzeStepResult;

    let score = 0;
    if (r.hasIntro) score += 0.25;
    if (r.hasTechStack) score += 0.25;
    if (r.hasProjects) score += 0.40;
    if (r.hasContact) score += 0.10;

    return score; // score between 0 and 1
  })
  .generateReason(({ results, score }) => {
    return `Portfolio completeness score: ${score}. ${results.analyzeStepResult?.explanation}`;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  portfolioQualityScorer,
};
