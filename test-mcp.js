import { McpService } from './services/McpService.js';

async function runTest() {
    console.log("=== INICIANDO TEST DE INTEGRACIÓN MCP ===");
    
    // Forzamos la URL al localhost para la prueba local
    process.env.MCP_SERVER_URL = "http://localhost:8083/sse";
    
    console.log("1. Conectando al servidor...");
    const client = await McpService.initMcpClient();
    
    if (!client) {
        console.error("❌ FAKEO: No se pudo conectar al servidor. Asegúrate de que el servidor MCP (GymTracker-mcp-server) esté corriendo en el puerto 8083.");
        process.exit(1);
    }
    
    console.log("2. Recuperando herramientas disponibles (List Tools)...");
    const tools = await McpService.getMcpTools();
    console.log("Herramientas encontradas:", JSON.stringify(tools, null, 2));
    
    if (tools.length > 0) {
        console.log("3. Probando cada herramienta con un ID simulado:");
        for (const tool of tools) {
            console.log(`\n-> Ejecutando '${tool.name}'...`);
            try {
                const result = await McpService.callMcpTool(tool.name, { userId: "user123" });
                console.log(`✅ Resultado de ${tool.name}:`, JSON.stringify(result, null, 2));
            } catch (error) {
                console.error(`❌ Error ejecutando ${tool.name}:`, error);
            }
        }
    } else {
        console.log("⚠️ No se encontraron herramientas en el servidor.");
    }
    
    console.log("\n=== TEST COMPLETADO ===");
    process.exit(0);
}

runTest();
