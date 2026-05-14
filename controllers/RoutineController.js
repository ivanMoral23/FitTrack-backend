import { RoutineModel } from "../models/routineModel.js";
import ExerciceModel from "../models/exerciceModel.js";
import WorkoutSessionModel from "../models/workoutSessionModel.js";

export class RoutineController {

  // POST /routines/create
  static async createRoutine(req, res) {
    try {
      const body = req.body;
      if (!body.name || !body.exercises) {
        return res.status(400).json({ message: "Nombre y ejercicios son obligatorios." });
      }

      const payload = {
        userId: req.user.id, // Obtenido del token JWT a través de authMiddleware
        name: body.name,
        focus: body.focus || [],
        exercises: body.exercises,
        isSystemRoutine: false,
      };

      const newRoutine = await RoutineModel.createRoutine(payload);
      return res.status(201).json({ message: "Rutina creada satisfactoriamente", routine: newRoutine });
    } catch (error) {
      return res.status(500).json({ message: "Error al crear rutina", error: error.message });
    }
  }

  // GET /routines/my-routines
  static async getMyRoutines(req, res) {
    try {
      const routines = await RoutineModel.getByUserId(req.user.id);
      return res.status(200).json({ message: "Mis rutinas", routines });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener rutinas", error: error.message });
    }
  }

  // GET /routines/recommendations
  static async getRecommendations(req, res) {
    try {
      const routines = await RoutineModel.getRecommendations();
      return res.status(200).json({ message: "Rutinas recomendadas", routines });
    } catch (error) {
       return res.status(500).json({ message: "Error al obtener recomendaciones", error: error.message });
    }
  }

  // POST /routines/generate-ai
  static async generateAiRoutine(req, res) {
    try {
      const userId = req.user.id;
      const { difficulty = 'medium' } = req.body;

      const difficultyMap = { 'Principiante': 'easy', 'Intermedio': 'medium', 'Avanzado': 'hard', 'easy': 'easy', 'medium': 'medium', 'hard': 'hard' };
      const dbDifficulty = difficultyMap[difficulty] || 'medium';

      // Obtener historial de entrenamientos del usuario
      const workouts = await WorkoutSessionModel.getByUser(userId);
      const recentWorkouts = workouts.slice(-5);
      let workoutContext = "El usuario no tiene entrenamientos recientes.";
      if (recentWorkouts.length > 0) {
        workoutContext = `Sus últimos ${recentWorkouts.length} entrenamientos:\n` +
          recentWorkouts.map(w => `- Rutina: ${w.nombre_rutina}`).join('\n');
      }

      let muscleGroups = ['Pecho', 'Bíceps'];
      let routineName = `Rutina IA ${difficulty}`;

      try {
        const llamaUrl = process.env.LLAMA_URL || 'http://host.docker.internal:8080/api/chat';
        const prompt = `Basándote en el historial de entrenamientos del usuario:\n${workoutContext}\n\nNivel de dificultad: ${difficulty}\n\nDevuelve ÚNICAMENTE un objeto JSON válido con este formato exacto, sin texto adicional:\n{"muscleGroups": ["Pecho", "Tríceps"], "routineName": "Nombre de la rutina"}\n\nElige 1-3 grupos musculares de esta lista: Pecho, Espalda, Hombros, Bíceps, Tríceps, Piernas, Abdominales, Glúteos. Prioriza los que el usuario lleve más tiempo sin entrenar.`;

        const llmResponse = await fetch(llamaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "llama3.1:8b",
            messages: [
              { role: "system", content: "Eres un planificador de rutinas de gimnasio. Respondes ÚNICAMENTE con JSON válido, sin texto adicional ni markdown." },
              { role: "user", content: prompt }
            ],
            stream: false
          })
        });

        if (llmResponse.ok) {
          const llmJson = await llmResponse.json();
          const content = llmJson.message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.muscleGroups && Array.isArray(parsed.muscleGroups) && parsed.muscleGroups.length > 0) {
              muscleGroups = parsed.muscleGroups;
            }
            if (parsed.routineName) routineName = parsed.routineName;
          }
        }
      } catch (llmError) {
        console.warn('[generateAiRoutine] LLM no disponible, usando grupos por defecto:', llmError.message);
      }

      // Buscar ejercicios por grupo muscular y dificultad
      const allExercises = [];
      for (const group of muscleGroups) {
        const groupExercises = await ExerciceModel.getByMuscleGroup(group, userId);
        const filtered = groupExercises.filter(e => e.difficulty === dbDifficulty);
        allExercises.push(...filtered.slice(0, 3));
      }

      // Si no hay ejercicios con esa dificultad, buscar sin filtro
      if (allExercises.length === 0) {
        for (const group of muscleGroups) {
          const groupExercises = await ExerciceModel.getByMuscleGroup(group, userId);
          allExercises.push(...groupExercises.slice(0, 3));
        }
      }

      if (allExercises.length === 0) {
        return res.status(404).json({ message: 'No se encontraron ejercicios para los grupos musculares recomendados.' });
      }

      const setsRepsMap = { easy: { sets: 3, reps: 12 }, medium: { sets: 4, reps: 10 }, hard: { sets: 5, reps: 8 } };
      const { sets, reps } = setsRepsMap[dbDifficulty];

      const newRoutine = await RoutineModel.createRoutine({
        userId,
        name: routineName,
        focus: muscleGroups,
        exercises: allExercises.map(ex => ({ exerciseId: ex._id, sets, reps })),
        isSystemRoutine: false
      });

      const populated = await newRoutine.populate('exercises.exerciseId');
      return res.status(201).json({ message: 'Rutina generada exitosamente', routine: populated });
    } catch (error) {
      console.error('[RoutineController] generateAiRoutine error:', error);
      return res.status(500).json({ message: 'Error al generar rutina con IA', error: error.message });
    }
  }

  // DELETE /routines/:id
  static async deleteRoutine(req, res) {
    try {
      const deleted = await RoutineModel.deleteByIdAndUser(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Rutina no encontrada o no tienes permiso para eliminarla." });
      }
      return res.status(200).json({ message: "Rutina eliminada correctamente." });
    } catch (error) {
      return res.status(500).json({ message: "Error al eliminar rutina", error: error.message });
    }
  }
}
