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

    const response = await agent.generate([
      {
        role: "user",
        content: prompt,
      },
    ]);

    return { portfolio: response.text };
  }
});






// const portfolioSchema = z.object({
//     name: z.string(),
//     title: z.string().default(""),
//     summary: z.string(),
//     techStack: z.array(z.string()),
//     projects: z.array(z.object({
//       name: z.string(),
//       description: z.string(),
//       tech: z.array(z.string()),
//       link: z.string(),
//       highlights: z.array(z.string()),
//     })),
//     contact: z.object({
//       email: z.string().optional().default(""),
//       github: z.string().optional().default(""),
//     }),
//     template: z.string().default("clean"),
//     theme: z.string().optional(),
//     profileImage: z.string().optional().default(""),
//   });
  

// const generatePortfolio = createStep({
//   id: "generate-portfolio",
//   description: "Ask the agent to generate a portfolio using the repos",
//   inputSchema: z.object({
//     repos: z.array(repoSchema),
//     techStack: z.array(z.string()),
//   }),
//   outputSchema: z.object({
//     portfolio: portfolioSchema, // ✅ Use the shared schema
//   }),
//   execute: async ({ inputData, mastra }) => {
//     const agent = mastra?.getAgent("exhibitAgent");
//     if (!agent) throw new Error("Exhibit Agent not found");

//     const prompt = `
//     Generate a portfolio JSON using ONLY this exact schema:
    
//     {
//       "name": "Developer Name",
//       "title": "Software Engineer | React | TypeScript",
//       "summary": "Short professional summary",
//       "techStack": ["React", "TypeScript", "Node.js"],
//       "projects": [
//         {
//           "name": "Project Name",
//           "description": "One-line what it does",
//           "tech": ["React", "TypeScript"],
//           "link": "https://github.com/...",
//           "highlights": ["achievement 1", "achievement 2"]
//         }
//       ],
//       "contact": {
//         "email": "user@example.com",
//         "github": "https://github.com/username"
//       },
//       "template": "clean",
//       "theme": "dark",
//       "profileImage": ""   
//     }
    
//     RULES:
//     - Only include repos relevant to the tech stack.
//     - Rank projects by stars (highest first).
//     - Return ONLY JSON. No markdown, no explanation.
//     - If anything is missing, use empty strings or empty arrays, not null.
    
//     Tech stack: ${inputData.techStack.join(", ")}
//     Repositories:
//     ${JSON.stringify(inputData.repos, null, 2)}
//     `;
    

//     const response = await agent.stream([
//       {
//         role: 'user',
//         content: prompt,
//       },
//     ]);

//     let portfolioText = '';
//     for await (const chunk of response.textStream) {
//       portfolioText += chunk;
//     }

//     // Parse the JSON response
//     const portfolio = JSON.parse(portfolioText.trim());

//     return { portfolio };
//   }
// });


// const renderPortfolioStep = createStep({
//   id: 'render-portfolio',
//   description: 'Render portfolio JSON into template (HTML/PDF)',
//   inputSchema: z.object({
//     portfolio: portfolioSchema, // ✅ Changed from z.any() to portfolioSchema
//     template: z.string().default('clean'),
//     format: z.enum(['html','pdf']).default('pdf')
//   }),
//   outputSchema: z.object({
//     url: z.string(),
//     filename: z.string()
//   }),
//   execute: async ({ inputData, mastra }) => {
//     const agent = mastra?.getAgent("exhibitAgent");
//     if (!agent) throw new Error("Exhibit Agent not found");

//     const tool = agent.tools["render-portfolio"];
//     if (!tool) throw new Error("Tool 'render-portfolio' not found");
    
//     const res = await tool.execute({
//       context: {
//         portfolio: inputData.portfolio,
//         template: inputData.template,
//         format: inputData.format,
//       },
//     });
    
//     return res;
//   }
// });



// // FINAL WORKFLOW
// const exhibitWorkflow = createWorkflow({
//   id: "exhibit-workflow",
//   inputSchema: z.object({
//     githubUsername: z.string(),
//     techStack: z.array(z.string()),
//   }),
//   outputSchema: z.object({
//     url: z.string(),
//     filename: z.string(),
//   }),
// })
//   .then(fetchRepos)
//   .then(generatePortfolio)
//   .then(renderPortfolioStep);


// exhibitWorkflow.commit();

// export { exhibitWorkflow };




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