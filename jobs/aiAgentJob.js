import cron from 'node-cron';
import { InsightModel } from '../models/insightModel.js';
import WorkoutSessionModel from '../models/workoutSessionModel.js';
import UserModel from '../models/userModel.js';

export const runAiAgentForUser = async (userId, isManualTrigger = false) => {
    // Si es manual, usamos las nubes para que sea rápido y no bloquee el chat local.
    // Si es el cron job (noche), usamos solo Llama local para ahorrar.
    const MODELS_TO_TRY = isManualTrigger 
        ? ["gemini-flash-latest", "groq-llama", "cohere-command", "ollama-local"]
        : ["ollama-local"];

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
    const COHERE_API_KEY = process.env.COHERE_API_KEY || "";

    try {
        const user = await UserModel.getById(userId);
        if (!user) return;

        const workouts = await WorkoutSessionModel.getByUser(userId);
        const recentWorkouts = workouts.slice(-5);
        let workoutContext = "El usuario no tiene entrenamientos recientes.";
        if (recentWorkouts.length > 0) {
            workoutContext = `Últimos entrenamientos:\n` + recentWorkouts.map(w => `- ${w.nombre_rutina}: ${w.duracion_minutos} min, ${w.volumen_total} kg`).join('\n');
        }

        const prompt = `Analiza el progreso de ${user.username}:\nPerfil: ${user.age} años, ${user.weight}kg, ${user.height}cm.\n${workoutContext}\n\nEscribe un ÚNICO PÁRRAFO de consejo profesional y breve.`;

        let finalMessage = null;

        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`DEBUG: [Agente] Usando ${modelName} (${isManualTrigger ? 'Manual' : 'Nocturno'})...`);

                if (modelName === "ollama-local") {
                    const llamaUrl = process.env.LLAMA_URL || 'http://host.docker.internal:8080/api/chat';
                    const resp = await fetch(llamaUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ model: "llama3.1:8b", messages: [{ role: "user", content: prompt }], stream: false })
                    });
                    if (!resp.ok) throw new Error("Ollama falló");
                    const json = await resp.json();
                    finalMessage = json.message.content;
                    break;
                } else if (modelName === "groq-llama") {
                    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
                    const resp = await fetch(groqUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` }, 
                        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] })
                    });
                    if (!resp.ok) throw new Error("Groq falló");
                    const data = await resp.json();
                    finalMessage = data.choices[0].message.content;
                    break;
                } else if (modelName === "cohere-command") {
                    const cohereUrl = "https://api.cohere.ai/v1/chat";
                    const resp = await fetch(cohereUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COHERE_API_KEY}` }, 
                        body: JSON.stringify({ model: "command-r-plus", message: prompt })
                    });
                    if (!resp.ok) throw new Error("Cohere falló");
                    const data = await resp.json();
                    finalMessage = data.text;
                    break;
                } else {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
                    const resp = await fetch(url, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
                    });
                    if (!resp.ok) throw new Error("Gemini falló");
                    const data = await resp.json();
                    finalMessage = data.candidates[0].content.parts[0].text;
                    break;
                }
            } catch (err) {
                console.warn(`WARN: [Agente] falló ${modelName}: ${err.message}`);
            }
        }

        if (finalMessage) {
            let type = 'general';
            const msgFilter = finalMessage.toLowerCase();
            if (msgFilter.includes('caloría') || msgFilter.includes('dieta')) type = 'nutrition';
            else if (msgFilter.includes('entrena') || msgFilter.includes('rutina')) type = 'training';

            await InsightModel.create({ userId: user._id, message: finalMessage, type: type });
            console.log(`[Agente] -> Éxito con ${user.username}`);
            return finalMessage;
        }

    } catch (e) {
        console.error(`[Agente Error] user ${userId}:`, e.message);
    }
};

export const runAiRecommendationForUser = async (userId) => {
    const MODELS_TO_TRY = ["gemini-flash-latest", "groq-llama", "cohere-command", "ollama-local"];

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
    const COHERE_API_KEY = process.env.COHERE_API_KEY || "";

    try {
        const user = await UserModel.getById(userId);
        if (!user) return null;

        const workouts = await WorkoutSessionModel.getByUser(userId);
        const recentWorkouts = workouts.slice(-7);
        let workoutContext = "El usuario no ha entrenado recientemente.";
        if (recentWorkouts.length > 0) {
            workoutContext = `Últimos entrenamientos:\n` + recentWorkouts.map(w => `- ${w.nombre_rutina}`).join('\n');
        }

        const prompt = `Eres un experto entrenador personal.\nPerfil del cliente: ${user.age} años, ${user.weight}kg.\n${workoutContext}\n\nBasándote en sus entrenamientos recientes, recomiéndale qué grupo muscular le convendría más entrenar hoy y por qué. Responde de forma directa, en un solo párrafo y con un tono motivador. NO uses formato markdown complejo.`;

        let finalMessage = null;

        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`DEBUG: [Recomendación] Usando ${modelName}...`);

                if (modelName === "ollama-local") {
                    const llamaUrl = process.env.LLAMA_URL || 'http://host.docker.internal:8080/api/chat';
                    const resp = await fetch(llamaUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ model: "llama3.1:8b", messages: [{ role: "user", content: prompt }], stream: false })
                    });
                    if (!resp.ok) throw new Error("Ollama falló");
                    const json = await resp.json();
                    finalMessage = json.message.content;
                    break;
                } else if (modelName === "groq-llama") {
                    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
                    const resp = await fetch(groqUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` }, 
                        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] })
                    });
                    if (!resp.ok) throw new Error("Groq falló");
                    const data = await resp.json();
                    finalMessage = data.choices[0].message.content;
                    break;
                } else if (modelName === "cohere-command") {
                    const cohereUrl = "https://api.cohere.ai/v1/chat";
                    const resp = await fetch(cohereUrl, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COHERE_API_KEY}` }, 
                        body: JSON.stringify({ model: "command-r-plus", message: prompt })
                    });
                    if (!resp.ok) throw new Error("Cohere falló");
                    const data = await resp.json();
                    finalMessage = data.text;
                    break;
                } else {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
                    const resp = await fetch(url, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
                    });
                    if (!resp.ok) throw new Error("Gemini falló");
                    const data = await resp.json();
                    finalMessage = data.candidates[0].content.parts[0].text;
                    break;
                }
            } catch (err) {
                console.warn(`WARN: [Recomendación] falló ${modelName}: ${err.message}`);
            }
        }

        if (finalMessage) {
            console.log(`[Recomendación] -> Éxito con ${user.username}`);
            return finalMessage;
        }

    } catch (e) {
        console.error(`[Recomendación Error] user ${userId}:`, e.message);
    }
    return null;
};

export const startAiAgentCronJob = () => {
    cron.schedule('0 2 * * *', async () => {
        console.log("Iniciando Agente Nocturno (Modo Ahorro Llama)...");
        try {
            const users = await UserModel.getAll();
            for (const user of users) {
                await runAiAgentForUser(user._id, false); // false = nocturno
            }
        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
};
