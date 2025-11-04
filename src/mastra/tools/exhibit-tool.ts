
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// GitHub API returns a LOT of metadata.
// We only extract what our agent needs.
interface GitHubRepoResponse {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
}

// Fetch GitHub Repositories
export const githubRepoTool = createTool({
  id: "fetch-github-repos",
  description: "Fetch public GitHub repositories of a user",
  inputSchema: z.object({
    githubInput: z
      .string()
      .describe("GitHub profile URL or username (e.g., 'octocat' or 'https://github.com/octocat')"),
  }),
  outputSchema: z.object({
    repos: z.array(
      z.object({
        name: z.string(),
        description: z.string().nullable(),
        language: z.string().nullable(),
        url: z.string(),
        stars: z.number(),
        forks: z.number(),
      })
    ),
  }),

  // This method is what the agent will call when it uses the tool
  execute: async ({ context }) => {
    const username = extractUsername(context.githubInput);

    if (!username) {
      throw new Error("Invalid GitHub username or URL");
    }

    const repos = await fetchRepos(username);

    return { repos };
  },
});


// Helper: extract username from URL
function extractUsername(input: string): string | null {
  try {
    if (input.startsWith("http")) {
      const url = new URL(input);
      return url.pathname.replace("/", "").trim();
    }
    return input.trim();
  } catch (e) {
    return null;
  }
}


// Helper: fetch repos from GitHub API
async function fetchRepos(username: string) {
  const response = await fetch(`https://api.github.com/users/${username}/repos`);

  if (!response.ok) {
    throw new Error(`GitHub user '${username}' not found`);
  }

  const repos = (await response.json()) as GitHubRepoResponse[];

  // Clean and simplify repo data
  return repos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    language: repo.language,
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
  }));
}
