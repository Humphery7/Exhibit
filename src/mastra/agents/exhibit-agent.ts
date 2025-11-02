import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import { githubRepoTool } from "../tools/exhibit-tool";
import { scorers } from "../scorers/exhibit-scorer";

export const exhibitAgent = new Agent({
  name: "Exhibit Agent",
  instructions: `
      You are Exhibit — an AI that generates a clean, professional portfolio
      based on the user's GitHub profile and tech stack.

      Your objective:
      1. Use the 'githubRepoTool' to fetch GitHub repositories.
      2. Select repos relevant to the user's stated tech stack.
      3. Generate a portfolio output that contains these sections:
        - Short introduction
        - Tech stack section
        - Projects section (for each repository: name, description, what was done, link)
        - Contact / GitHub link

      Rules:
      - If no GitHub username is provided, ask the user for it.
      - If the GitHub profile has many projects, select the most relevant and recent.
      - Format your response professionally, using markdown.
      - Do NOT dump raw JSON to the user. Convert the response into portfolio content.
  `,

  model: "google/gemini-2.5-flash",
  tools: { githubRepoTool },

  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },

    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },

    portfolioQuality: {
      scorer: scorers.portfolioQualityScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
  },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
