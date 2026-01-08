import { McpServer, McpTool } from '../types';
import { FunctionDeclaration, SchemaType } from '@google/genai';

/**
 * A local MCP Server implementation.
 * In a full implementation, this would connect to external MCP servers via SSE/Stdio.
 * For this web CLI, we implement "Standard Tools" locally.
 */
class LocalMcpRegistry {
  private servers: McpServer[] = [];

  constructor() {
    this.registerServer(this.createStandardServer());
  }

  private createStandardServer(): McpServer {
    return {
      name: "standard-utils",
      tools: [
        {
          name: "get_current_time",
          description: "Get the current time in a specific timezone",
          parameters: {
            type: 'OBJECT',
            properties: {
              timezone: {
                type: 'STRING',
                description: "The timezone to get the time for (e.g., 'UTC', 'America/New_York')",
              },
            },
            required: ['timezone'],
          },
          execute: async ({ timezone }: { timezone: string }) => {
            try {
              const time = new Date().toLocaleString('en-US', { timeZone: timezone });
              return { time };
            } catch (e) {
              return { error: `Invalid timezone: ${timezone}` };
            }
          },
        },
        {
          name: "get_weather",
          description: "Get the simulated weather for a city",
          parameters: {
            type: 'OBJECT',
            properties: {
              city: { type: 'STRING', description: "The city name" },
            },
            required: ['city'],
          },
          execute: async ({ city }: { city: string }) => {
            // Mock weather data
            const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy'];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const temp = Math.floor(Math.random() * 30) + 10;
            return {
              city,
              condition,
              temperature: `${temp}°C`,
              humidity: `${Math.floor(Math.random() * 50) + 50}%`
            };
          },
        },
        {
          name: "roll_dice",
          description: "Roll a standard d6 die",
          parameters: {
            type: 'OBJECT',
            properties: {},
          },
          execute: async () => {
            return { result: Math.floor(Math.random() * 6) + 1 };
          }
        }
      ]
    };
  }

  public registerServer(server: McpServer) {
    this.servers.push(server);
  }

  public getGeminiTools(): { functionDeclarations: FunctionDeclaration[] }[] {
    const allTools: FunctionDeclaration[] = this.servers.flatMap(server => 
      server.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as any, // Type assertion for simple compatibility
      }))
    );
    
    if (allTools.length === 0) return [];
    
    return [{ functionDeclarations: allTools }];
  }

  public async executeTool(name: string, args: any): Promise<any> {
    for (const server of this.servers) {
      const tool = server.tools.find(t => t.name === name);
      if (tool) {
        return await tool.execute(args);
      }
    }
    throw new Error(`Tool ${name} not found.`);
  }
}

export const mcpRegistry = new LocalMcpRegistry();
