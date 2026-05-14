import { McpService } from '../services/McpService.js';

let cachedTools = null;

export class ChatController {
  static async chat(req, res) {
    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
    const COHERE_API_KEY = process.env.COHERE_API_KEY || "";

    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const MODELS_TO_TRY = ["gemini-flash-latest", "gemini-pro-latest", "groq-llama", "cohere-command", "ollama-local"];

    try {
      if (!cachedTools) {
        const mcpTools = await McpService.getMcpTools();
        cachedTools = mcpTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }));
      }

      let finalResponse = null;

      for (const modelName of MODELS_TO_TRY) {
        try {
          console.log(`DEBUG: [Chat] Intentando con: ${modelName}`);

          if (modelName === "ollama-local") {
            // --- OLLAMA CON MCP (TOOL CALLING LOOP) ---
            const llamaUrl = process.env.LLAMA_URL || 'http://host.docker.internal:8080/api/chat';
            const ollamaTools = cachedTools.map(t => ({
                type: "function",
                function: { name: t.name, description: t.description, parameters: t.parameters }
            }));

            const sys = `Eres "Expert Assist" de GymTracker. Foco: 100% Fitness y Nutrición. 
            REGLAS: Prohibido código de programación. Prohibido temas ajenos al deporte. USA herramientas para guardar datos en cuanto el usuario lo apruebe.`;
            let messages = [
                { role: "system", content: sys },
                { role: "user", content: prompt }
            ];

            const resp = await fetch(llamaUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "llama3.1:8b", messages, tools: ollamaTools, stream: false })
            });
            const data = await resp.json();
            const message = data.message;

            if (message.tool_calls) {
                console.log(`DEBUG: [Ollama] Ejecutando ${message.tool_calls.length} herramientas...`);
                messages.push(message);
                for (const toolCall of message.tool_calls) {
                    const args = typeof toolCall.function.arguments === 'string' ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
                    args.userId = req.user.id;
                    console.log(`DEBUG: [McpService] Llamando a tool '${toolCall.function.name}' con argumentos:`, JSON.stringify(args));
                    const result = await McpService.callMcpTool(toolCall.function.name, args);
                    console.log(`DEBUG: [McpService] Resultado de tool '${toolCall.function.name}':`, JSON.stringify(result).substring(0, 200));
                    messages.push({
                        role: "tool",
                        content: JSON.stringify(result.content)
                    });
                }
                const secondResp = await fetch(llamaUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: "llama3.1:8b", messages, stream: false })
                });
                const secondData = await secondResp.json();
                finalResponse = secondData.message.content;
            } else {
                finalResponse = message.content;
            }
            console.log("SUCCESS: [Chat] Respondido por OLLAMA LOCAL con MCP");
            break;

          } else if (modelName === "groq-llama") {
            // Groq MCP Loop
            const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
            const groqTools = cachedTools.map(t => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } }));
            const sys = `Eres "Expert Assist" de GymTracker. Solo respondes sobre Fitness y Nutrición. 
            PROHIBIDO generar código o hablar de otros temas. Si el usuario acepta una rutina, USA las herramientas de inmediato.`;
            const messages = [{ role: "system", content: sys }, { role: "user", content: prompt }];
            const resp = await fetch(groqUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, tools: groqTools }) });
            const data = await resp.json();
            const choice = data.choices[0];
            if (choice.message.tool_calls) {
                messages.push(choice.message);
                for (const call of choice.message.tool_calls) {
                    const args = JSON.parse(call.function.arguments);
                    args.userId = req.user.id;
                    const resTool = await McpService.callMcpTool(call.function.name, args);
                    messages.push({ tool_call_id: call.id, role: "tool", name: call.function.name, content: JSON.stringify(resTool.content) });
                }
                const res2 = await fetch(groqUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages }) });
                const d2 = await res2.json();
                finalResponse = d2.choices[0].message.content;
            } else { finalResponse = choice.message.content; }
            break;

          } else if (modelName === "cohere-command") {
            // Cohere MCP Loop
            const cohereUrl = "https://api.cohere.ai/v1/chat";
            const cohereTools = cachedTools.map(t => ({ name: t.name, description: t.description, parameter_definitions: t.parameters.properties }));
            const sys = `Eres "Expert Assist" de GymTracker. Foco 100% Fitness/Nutrición. NO generes código. Proactivo con herramientas.`;
            const resp = await fetch(cohereUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COHERE_API_KEY}` }, body: JSON.stringify({ model: "command-r-plus", message: prompt, preamble: sys, tools: cohereTools }) });
            const data = await resp.json();
            if (data.tool_calls) {
                const results = [];
                for (const call of data.tool_calls) {
                    const args = call.parameters; args.userId = req.user.id;
                    const resTool = await McpService.callMcpTool(call.name, args);
                    results.push({ call, outputs: [resTool.content] });
                }
                const res2 = await fetch(cohereUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COHERE_API_KEY}` }, body: JSON.stringify({ model: "command-r-plus", message: prompt, tool_results: results, chat_history: data.chat_history }) });
                const d2 = await res2.json();
                finalResponse = d2.text;
            } else { finalResponse = data.text; }
            break;

          } else {
            // Gemini Native
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
            const sys = `Eres "Expert Assist", el núcleo de inteligencia de GymTracker. Tu propósito es ÚNICAMENTE el asesoramiento en Fitness, Entrenamiento y Nutrición.

REGLAS CRÍTICAS DE SEGURIDAD:
1. ALCANCE: Si el usuario te pide algo fuera de la salud física, el ejercicio o la dieta (como programar en Python, contar chistes, historia, etc.), debes rechazarlo cortésmente y redirigirlo a sus objetivos de entrenamiento.
2. PROACTIVIDAD: Si el usuario confirma una rutina o da un nombre, USA 'create_user_routine' AL INSTANTE. No pidas permiso dos veces.
3. NO CÓDIGO: Tienes estrictamente prohibido generar código de programación (Python, JS, etc.). Tu lenguaje es el de las pesas y los macros.
4. CONTEXTO: Utiliza siempre los datos del usuario (peso, altura, edad) si están disponibles para dar consejos precisos.

Responde de forma profesional, motivadora y centrada en la acción.`;
            const contents = [{ role: "user", parts: [{ text: sys }] }, { role: "model", parts: [{ text: "Entendido. Soy Expert Assist. Mi foco es 100% Fitness y Nutrición. Rechazaré cualquier petición fuera de este ámbito y usaré mis herramientas para ayudar al usuario de forma proactiva." }] }, { role: "user", parts: [{ text: prompt }] }];
            const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, tools: [{ function_declarations: cachedTools }] }) });
            const data = await resp.json();
            if (data.error) throw new Error(data.error.message);
            const cand = data.candidates[0];
            const tCalls = cand.content.parts.filter(p => p.functionCall);
            if (tCalls.length > 0) {
              const fRes = [];
              for (const call of tCalls) {
                const args = call.functionCall.args; args.userId = req.user.id;
                const resTool = await McpService.callMcpTool(call.functionCall.name, args);
                fRes.push({ functionResponse: { name: call.functionCall.name, response: { content: resTool.content.map(c => c.text).join("\n") } } });
              }
              console.log(`DEBUG: [Gemini] Enviando resultados de herramientas de vuelta a la IA...`);
              contents.push(cand.content); 
              contents.push({ role: "function", parts: fRes });
              
              const secondResp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, tools: [{ function_declarations: cachedTools }] }) });
              const secondData = await secondResp.json();
              
              if (secondData.candidates && secondData.candidates[0].content) {
                finalResponse = secondData.candidates[0].content.parts[0].text;
              } else {
                console.warn("WARN: [Gemini] La segunda respuesta no tiene candidatos:", JSON.stringify(secondData));
                throw new Error("La IA no pudo generar una respuesta tras usar las herramientas.");
              }
            } else {
              finalResponse = cand.content.parts[0].text;
            }
            console.log(`SUCCESS: [Chat] Respondido por GEMINI (${modelName})`);
            break;
          }
        } catch (err) { 
            console.warn(`WARN: [Chat] Error en ${modelName}:`, err.message);
            if (err.stack) console.error(err.stack);
        }
      }
      console.log(`DEBUG: [ChatController] Enviando al móvil: "${(finalResponse || "").substring(0, 50)}..."`);
      return res.json({ response: finalResponse || "¡Hecho! He procesado tu solicitud correctamente." });
    } catch (error) {
      console.error("DEBUG: [ChatController] ERROR CRÍTICO:", error);
      return res.json({ response: "Lo siento, ha ocurrido un error al procesar tu solicitud." });
    }
  }
}
