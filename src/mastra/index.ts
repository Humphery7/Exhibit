
// import { Mastra } from '@mastra/core/mastra';
// import { PinoLogger } from '@mastra/loggers';
// import { LibSQLStore } from '@mastra/libsql';
// import { weatherWorkflow } from './workflows/weather-workflow';
// import { weatherAgent } from './agents/weather-agent';
// import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer';

// export const mastra = new Mastra({
//   workflows: { weatherWorkflow },
//   agents: { weatherAgent },
//   scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
//   storage: new LibSQLStore({
//     // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
//     url: ":memory:",
//   }),
//   logger: new PinoLogger({
//     name: 'Mastra',
//     level: 'info',
//   }),
//   telemetry: {
//     // Telemetry is deprecated and will be removed in the Nov 4th release
//     enabled: false, 
//   },
//   observability: {
//     // Enables DefaultExporter and CloudExporter for AI tracing
//     default: { enabled: true }, 
//   },
// });


// import { Mastra } from '@mastra/core/mastra';
// import { PinoLogger } from '@mastra/loggers';
// import { LibSQLStore } from '@mastra/libsql';
// import { exhibitWorkflow } from './workflows/exhibit-workflow';
// import { exhibitAgent } from './agents/exhibit-agent';
// import { toolCallAppropriatenessScorer, completenessScorer, portfolioQualityScorer } from './scorers/exhibit-scorer';

// export const mastra = new Mastra({
//   workflows: { exhibitWorkflow },
//   agents: { exhibitAgent },
//   scorers: { toolCallAppropriatenessScorer, completenessScorer, portfolioQualityScorer },
//   storage: new LibSQLStore({
//     // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
//     url: ":memory:",
//   }),
//   logger: new PinoLogger({
//     name: 'Mastra',
//     level: 'info',
//   }),
//   telemetry: {
//     // Telemetry is deprecated and will be removed in the Nov 4th release
//     enabled: false, 
//   },
//   observability: {
//     // Enables DefaultExporter and CloudExporter for AI tracing
//     default: { enabled: true }, 
//   },
// });


import { Mastra } from '@mastra/core/mastra';

import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { a2aAgentRoute } from './routeHandler/a2a-agent-route';

import { exhibitWorkflow } from './workflows/exhibit-workflow';
import { exhibitAgent } from './agents/exhibit-agent';
import { toolCallAppropriatenessScorer, completenessScorer, portfolioQualityScorer } from './scorers/exhibit-scorer';

export const mastra = new Mastra({
  workflows: { exhibitWorkflow },
  agents: { exhibitAgent },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, portfolioQualityScorer },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    enabled: false,
  },
  observability: {
    default: { enabled: true },
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute]
  }
});

