import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  stars: z.number(),
  url: z.string(),
});

const fetchRepos = createStep({
  id: 'fetch-repos',
  description: 'Fetch GitHub repositories for the user',
  inputSchema: z.object({
    githubUsername: z.string().describe("GitHub username"),
    techStack: z.array(z.string()).describe("Tech stack the portfolio should focus on"),
  }),
  outputSchema: z.object({
    repos: z.array(repoSchema),
    techStack: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) throw new Error("Input data required");

    // Call GitHub API directly (same as tool does)
    const response = await fetch(`https://api.github.com/users/${inputData.githubUsername}/repos`);
    if (!response.ok) {
      throw new Error(`GitHub user '${inputData.githubUsername}' not found`);
    }
    const repos = (await response.json()) as Array<{
      name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
    }>;

    return {
      repos: repos.map((repo) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        url: repo.html_url,
      })),
      techStack: inputData.techStack,
    };
  }
});


const generatePortfolio = createStep({
  id: "generate-portfolio",
  description: "Ask the agent to generate a portfolio using the repos",
  inputSchema: z.object({
    repos: z.array(repoSchema),
    techStack: z.array(z.string()),
  }),
  outputSchema: z.object({
    portfolio: z.string(),
  }),

  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("exhibitAgent");
    if (!agent) throw new Error("Exhibit Agent not found");

    const prompt = `
      Generate a project portfolio using this information:

      Tech stack: ${inputData.techStack.join(", ")}
      Repositories:
      ${JSON.stringify(inputData.repos, null, 2)}

      Format response like this:

      🚀 *Portfolio for GitHub User*

      ✅ Featured Projects (ranked by importance)
      1. Project Name — short description
         ⭐ Tech used: [...]
         🔗 Link: repo URL

      Only pick repos relevant to the tech stack.
    `;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let portfolioText = '';
    for await (const chunk of response.textStream) {
      portfolioText += chunk;
    }

    return { portfolio: portfolioText };
  }
});


// FINAL WORKFLOW
const exhibitWorkflow = createWorkflow({
  id: "exhibit-workflow",
  inputSchema: z.object({
    githubUsername: z.string(),
    techStack: z.array(z.string()),
  }),
  outputSchema: z.object({
    portfolio: z.string(),
  }),
})
  .then(fetchRepos)
  .then(generatePortfolio);

exhibitWorkflow.commit();

export { exhibitWorkflow };
