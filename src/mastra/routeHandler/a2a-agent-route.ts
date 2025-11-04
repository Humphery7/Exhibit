// import { registerApiRoute } from '@mastra/core/server';
// import { randomUUID } from 'crypto';

// // Types to help TS shut up
// interface A2AMessagePart {
//   kind: 'text' | 'data';
//   text?: string;
//   data?: any;
// }

// interface A2AMessage {
//   role: string;
//   parts?: A2AMessagePart[];
//   messageId?: string;
//   taskId?: string;
// }

// export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
//   method: 'POST',
//   handler: async (c) => {
//     try {
//       const mastra = c.get('mastra');
//       const agentId = c.req.param('agentId');

//       // Parse JSON-RPC 2.0 request
//       const body = await c.req.json();
//       const { jsonrpc, id: requestId, params } = body;

//       if (jsonrpc !== '2.0' || !requestId) {
//         return c.json(
//           {
//             jsonrpc: '2.0',
//             id: requestId || null,
//             error: {
//               code: -32600,
//               message: 'Invalid Request: jsonrpc must be "2.0" and id is required'
//             }
//           },
//           400
//         );
//       }

//       const agent = mastra.getAgent(agentId);
//       if (!agent) {
//         return c.json(
//           {
//             jsonrpc: '2.0',
//             id: requestId,
//             error: {
//               code: -32602,
//               message: `Agent '${agentId}' not found`
//             }
//           },
//           404
//         );
//       }

//       const { message, messages, contextId, taskId } = params || {};
//       let messagesList: A2AMessage[] = [];

//       if (message) {
//         messagesList = [message];
//       } else if (messages && Array.isArray(messages)) {
//         messagesList = messages;
//       }

//       // ✅ Convert A2A messages to string[] — what mastra.generate() expects
//       const mastraMessages = messagesList.map((msg: A2AMessage) => {
//         const mergedContent =
//           msg.parts
//             ?.map((part: A2AMessagePart) =>
//               part.kind === 'text' ? part.text : JSON.stringify(part.data)
//             )
//             .join('\n') || '';

//         return `${msg.role}: ${mergedContent}`;
//       });

//       // Execute agent
//       const response = await agent.generate(mastraMessages);
//       const agentText = response.text || '';

//       const artifacts = [
//         {
//           artifactId: randomUUID(),
//           name: `${agentId}Response`,
//           parts: [{ kind: 'text', text: agentText }]
//         }
//       ];

//       // ✅ Include tool results as readable JSON text, not data blobs
//       if (response.toolResults && response.toolResults.length > 0) {
//         artifacts.push({
//           artifactId: randomUUID(),
//           name: 'ToolResults',
//           parts: response.toolResults.map((result: any) => ({
//             kind: 'text',
//             text: JSON.stringify(result)
//           }))
//         });
//       }

//       const history = [
//         ...messagesList.map((msg: A2AMessage) => ({
//           kind: 'message',
//           role: msg.role,
//           parts: msg.parts,
//           messageId: msg.messageId || randomUUID(),
//           taskId: msg.taskId || taskId || randomUUID()
//         })),
//         {
//           kind: 'message',
//           role: 'agent',
//           parts: [{ kind: 'text', text: agentText }],
//           messageId: randomUUID(),
//           taskId: taskId || randomUUID()
//         }
//       ];

//       return c.json({
//         jsonrpc: '2.0',
//         id: requestId,
//         result: {
//           id: taskId || randomUUID(),
//           contextId: contextId || randomUUID(),
//           status: {
//             state: 'completed',
//             timestamp: new Date().toISOString(),
//             message: {
//               messageId: randomUUID(),
//               role: 'agent',
//               parts: [{ kind: 'text', text: agentText }],
//               kind: 'message'
//             }
//           },
//           artifacts,
//           history,
//           kind: 'task'
//         }
//       });

//     } catch (error: any) {
//       return c.json(
//         {
//           jsonrpc: '2.0',
//           id: null,
//           error: {
//             code: -32603,
//             message: 'Internal error',
//             data: { details: error.message }
//           }
//         },
//         500
//       );
//     }
//   }
// });



import { registerApiRoute } from '@mastra/core/server';
import { randomUUID } from 'crypto';

// Types for TypeScript safety
interface A2AMessagePart {
  kind: 'text' | 'data';
  text?: string;
  data?: any;
}

interface A2AMessage {
  role: string;
  parts?: A2AMessagePart[];
  messageId?: string;
  taskId?: string;
}

export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    try {
      const mastra = c.get('mastra');
      const agentId = c.req.param('agentId');

      // Parse JSON-RPC 2.0 request payload
      const body = await c.req.json();
      const { jsonrpc, id: requestId, params } = body;

      if (jsonrpc !== '2.0' || !requestId) {
        return c.json(
          {
            jsonrpc: '2.0',
            id: requestId ?? null,
            error: {
              code: -32600,
              message: `Invalid Request: use JSON-RPC "2.0" and include an "id"`
            }
          },
          400
        );
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json(
          {
            jsonrpc: '2.0',
            id: requestId,
            error: {
              code: -32602,
              message: `Mastra agent '${agentId}' does not exist`
            }
          },
          404
        );
      }

      const { message, messages, contextId, taskId } = params ?? {};
      let messagesList: A2AMessage[] = [];

      // Accept both single message + batch messages
      if (message) {
        messagesList = [message];
      } else if (Array.isArray(messages)) {
        messagesList = messages;
      }

      // ✅ Convert A2A structure → what mastra.generate() expects
      const mastraMessages = messagesList.map((msg: A2AMessage) => {
        const mergedContent =
          msg.parts
            ?.map((part) =>
              part.kind === 'text'
                ? part.text
                : JSON.stringify(part.data, null, 2) // formatted JSON for readability
            )
            .join('\n') || '';

        return `${msg.role}: ${mergedContent}`;
      });

      // Execute the agent
      const response = await agent.generate(mastraMessages);
      const agentText = response.text ?? '';

      // ✅ Artifacts returned as displayable text, not blobs
      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: 'text', text: agentText }]
        }
      ];

      // ✅ Append toolResults properly
      if (Array.isArray(response.toolResults) && response.toolResults.length > 0) {
        artifacts.push({
          artifactId: randomUUID(),
          name: 'ToolResults',
          parts: response.toolResults.map((result: any) => ({
            kind: 'text',
            text: JSON.stringify(result, null, 2) // readable output
          }))
        });
      }

      const history = [
        ...messagesList.map((msg: A2AMessage) => ({
          kind: 'message',
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId ?? randomUUID(),
          taskId: msg.taskId ?? taskId ?? randomUUID()
        })),
        {
          kind: 'message',
          role: 'agent',
          parts: [{ kind: 'text', text: agentText }],
          messageId: randomUUID(),
          taskId: taskId ?? randomUUID()
        }
      ];

      return c.json({
        jsonrpc: '2.0',
        id: requestId,
        result: {
          id: taskId ?? randomUUID(),
          contextId: contextId ?? randomUUID(),
          status: {
            state: 'completed',
            timestamp: new Date().toISOString(),
            message: {
              role: 'agent',
              kind: 'message',
              messageId: randomUUID(),
              parts: [{ kind: 'text', text: agentText }]
            }
          },
          artifacts,
          history,
          kind: 'task'
        }
      });

    } catch (error: any) {
      console.error("A2A Route Error:", error); // ✅ Debugging
      return c.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32603,
            message: 'Internal server error occurred while executing agent',
            data: { details: error.message }
          }
        },
        500
      );
    }
  }
});
