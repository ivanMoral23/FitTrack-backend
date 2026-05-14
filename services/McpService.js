import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Configuraremos la URL del servidor MCP
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://nattech.fib.upc.edu:40433/sse";

export class McpService {
    static mcpClient = null;

    static async initMcpClient() {
        if (McpService.mcpClient) return McpService.mcpClient;

        try {
            const transport = new SSEClientTransport(new URL(MCP_SERVER_URL));
            
            McpService.mcpClient = new Client(
                {
                    name: "GymTracker-Backend-Client",
                    version: "1.0.0",
                },
                {
                    capabilities: {
                        tools: {},
                    },
                }
            );

            await McpService.mcpClient.connect(transport);
            // console.log("Conectado exitosamente al Servidor MCP en:", MCP_SERVER_URL);
            return McpService.mcpClient;
        } catch (error) {
            console.error("Error al conectar con el servidor MCP:", error);
            McpService.mcpClient = null;
            return null; // El backend debería seguir funcionando aunque no haya MCP
        }
    }

    static async getMcpTools() {
        if (!McpService.mcpClient) await McpService.initMcpClient();
        if (!McpService.mcpClient) return [];

        try {
            const toolsResponse = await McpService.mcpClient.listTools();
            return toolsResponse.tools;
        } catch (error) {
            console.error("Error obteniendo tools de MCP:", error);
            return [];
        }
    }

    static async callMcpTool(name, args) {
        if (!McpService.mcpClient) await McpService.initMcpClient();
        if (!McpService.mcpClient) throw new Error("MCP Client no está conectado");

        try {
            console.log(`DEBUG: [McpService] Llamando a tool '${name}' con argumentos:`, JSON.stringify(args));
            const result = await McpService.mcpClient.callTool({
                name: name,
                arguments: args
            });
            console.log(`DEBUG: [McpService] Resultado de tool '${name}':`, JSON.stringify(result).substring(0, 200));
            return result;
        } catch (error) {
            console.error(`Error ejecutando la tool ${name}:`, error);
            throw error;
        }
    }
}
