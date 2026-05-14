import { InsightModel } from '../models/insightModel.js';
import { runAiAgentForUser } from '../jobs/aiAgentJob.js';
import WorkoutSessionModel from '../models/workoutSessionModel.js';

export class InsightController {
    static async getInsights(req, res) {
        try {
            const insights = await InsightModel.find({ userId: req.user.id })
                                               .sort({ createdAt: -1 })
                                               .limit(20);
            return res.status(200).json({ insights });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching insights", error: error.message });
        }
    }

    static async triggerManualAgent(req, res) {
        console.log(`DEBUG: [InsightController] Petición de resumen manual recibida para usuario: ${req.user.id}`);
        try {
            const message = await runAiAgentForUser(req.user.id, true); // true = Petición manual (Rápida)
            if (message) {
                return res.status(200).json({ 
                    success: true, 
                    message: "Análisis manual completado",
                    insight: message
                });
            }
            return res.status(400).json({ success: false, message: "El agente no pudo generar el resumen." });
        } catch (error) {
            return res.status(500).json({ message: "Error al forzar el agente", error: error.message });
        }
    }

    static async getMuscleRecommendation(req, res) {
        try {
            const workouts = await WorkoutSessionModel.getByUser(req.user.id);
            const recentWorkouts = workouts.slice(-5);

            let workoutContext = "El usuario no tiene entrenamientos recientes.";
            if (recentWorkouts.length > 0) {
                workoutContext = `Sus últimos ${recentWorkouts.length} entrenamientos:\n` +
                    recentWorkouts.map(w => `- Rutina: ${w.nombre_rutina}, Duración: ${w.duracion_minutos || 0} min`).join('\n');
            }

            const prompt = `Analiza estos datos del usuario de una App de gimnasio:\n${workoutContext}\n\nBasándote en su historial, recomiéndale qué grupos musculares debería entrenar hoy para optimizar su recuperación y progreso. Escribe una respuesta directa, motivadora y concisa (máximo 2-3 líneas). No pongas saludos.`;

            const llamaUrl = process.env.LLAMA_URL || 'http://host.docker.internal:8080/api/chat';
            const body = {
                model: "llama3.1:8b",
                messages: [
                    { role: "system", content: "Eres un entrenador personal experto. Recomienda qué entrenar hoy basándote en el historial del usuario. Sé directo y motivador." },
                    { role: "user", content: prompt }
                ],
                stream: false
            };

            const response = await fetch(llamaUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error(`LLM falló con código ${response.status}`);
            const json = await response.json();
            return res.status(200).json({ recommendation: json.message.content });
        } catch (error) {
            console.error('[InsightController] getMuscleRecommendation error:', error);
            return res.status(500).json({ message: "Error al obtener recomendación", error: error.message });
        }
    }
}
