## Exhibit Agent — Automated Portfolio Builder

Exhibit Agent is an **AI-powered autonomous agent** built with **Mastra** that generates a complete project portfolio using just the user’s **GitHub profile** and/or **tech stack**.

The agent analyzes the user’s repositories, selects the most representative projects, extracts descriptions + tech stack, and outputs a structured, professional portfolio.

> Think of Exhibit as an automated "Portfolio Generator" that turns GitHub repos into a clean showcase ready to be used on personal websites, resumes, or LinkedIn.

---

## Features

| Feature                     | Description                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **GitHub Analysis**      | Reads user repos, commit activity, and project metadata.                                      |
| **AI Understanding**     | Detects project purpose, tech stack, and contributions.                                       |
| **Smart Selection**       | Picks the best repos based on activity, language, and relevance.                              |
| **Portfolio Generation** | Produces formatted output (Project → Description → Technologies).                             |
| **Tech Stack Priority**  | If a user provides a tech stack (e.g., *React + Node.js*), it only selects relevant projects. |

---

## How It Works (Flow)

1. User provides their **GitHub profile URL** or **GitHub repo**.
2. Agent fetches metadata about repos.
3. Agent analyzes repos using LLM reasoning.
4. Agent composes a portfolio with:

   * Project name
   * Short description
   * Tech stack used
   * What the user contributed (if detectable)

---

## Getting Started

### Prerequisites

Before running the project, ensure you have:

| Requirement  | Version                               |
| ------------ | ------------------------------------- |
| Node.js      | v18 or later                          |
| Mastra CLI   | Installed globally                    |
| GitHub Token | (Optional — makes repo access faster) |

---

### Installation

1. Clone the repository:

```bash
git clone https://github.com/<yourusername>/<repo-name>.git
cd <repo-name>
```

2. Install dependencies:

```bash
npm install
```

3. Login to Mastra (if not already):

```bash
mastra login
```

4. Start the Mastra agent locally:

```bash
mastra dev
```

---

## How to Use

There are **two ways** to use Exhibit:

---

### Option 1 — Through the Mastra Web UI

1. Run:

```bash
mastra dev
```

2. Go to the Mastra dashboard (link will appear in terminal).
3. Trigger the agent and provide your GitHub URL.

Example input:

```
GitHub: https://github.com/vercel
Tech Stack: TypeScript, Next.js
```

Output will be a generated portfolio.

---

### Option 2 — Programmatic Usage

Inside your code:

```ts
import { runAgent } from "./exhibit_agent";

const result = await runAgent({
  githubUrl: "https://github.com/yourusername",
  techStack: "React, Node.js"
});

console.log(result);
```

---

## Project Structure

```
/exhibit-mastra-app
│── /src
│   ├── agents/
│   │    └── exhibitAgent.ts
│   ├── tools/
│   │    └── githubTool.ts
│── mastra.config.ts
│── README.md
```

* `exhibitAgent.ts` → Contains agent logic
* `githubTool.ts` → Fetches GitHub repo data
* `mastra.config.ts` → Registers the agent and tools

---

## Deployment

Deploy to production using:

```bash
mastra deploy
```

After deploying, you get a public endpoint you can call from:

* Web apps
* Backend API
* Zapier / n8n automations

---

## Sample Response (Generated Portfolio)

```
Portfolio Generated Successfully!

Name: Real-Time Weather Dashboard  
Description: A dashboard that fetches live weather data using OpenWeather API.  
Tech Stack: React, TailwindCSS, TypeScript  

Name: Expense Tracker  
Description: A personal finance tracker with chart visualizations and budgeting.  
Tech Stack: Node.js, MongoDB, Express.js
```

---

## Future Features (WIP)

* PDF Export (one click portfolio CV)
* Automatic deployment to portfolio website template
* Frontend UI where users enter their GitHub link

---

## License

MIT License — feel free to use, modify, and share.

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

---

## Support / Contact

If you have questions or feature requests:

* Open an issue
* Or reach out to me at: `<humpheryufuoma@gmail.com>`

