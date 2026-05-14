import ExerciceModel from "../models/exerciceModel.js";

export class ExerciceController {

    static async getAllExercices(req, res) {
        try {
            const exercices = await ExerciceModel.getAll();
            return res.status(200).json({ message: "Ejercicios obtenidos:", exercices });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los ejercicios", error: error.message });
        }
    }

    static async getExerciceById(req, res) {
        try {
            const exercice = await ExerciceModel.getById(req.params.id);
            if (!exercice) {
                return res.status(404).json({ message: "Ejercicio no encontrado" });
            }
            return res.status(200).json({ message: "Ejercicio obtenido:", exercice });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener el ejercicio", error: error.message });
        }
    }

    static async getExercicesByMuscleGroup(req, res) {
        try {
            const muscleGroup = req.params.muscleGroup || req.params.grupo || req.query.grupo;
            const userId = req.user?.id ?? null;
            const exercices = await ExerciceModel.getByMuscleGroup(muscleGroup, userId);
            return res.status(200).json({ message: "Ejercicios obtenidos:", exercices });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los ejercicios", error: error.message });
        }
    }

    static async getExercicesByName(req, res) {
        try {
            const name = req.params.name || req.params.nombre || req.query.nombre;
            const exercices = await ExerciceModel.getByName(name);
            return res.status(200).json({ message: "Ejercicios obtenidos:", exercices });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los ejercicios", error: error.message });
        }
    }

    static async createExercice(req, res) {
      try {
          const body = req.body;
          if (!body) return res.status(400).json({ message: "Datos de ejercicio no válidos" });

          const mapDifficulty = (v) => {
            if (!v) return undefined;
            const m = String(v).toLowerCase();
            if (m === 'principiante') return 'easy';
            if (m === 'intermedio') return 'medium';
            if (m === 'avanzado') return 'hard';
            return m;
          };
          const mapMechanics = (v) => {
            if (!v) return undefined;
            const m = String(v).toLowerCase();
            if (m === 'compuesto') return 'compound';
            if (m === 'aislado') return 'isolation';
            return m;
          };
          const mapRecordType = (v) => {
            if (!v) return undefined;
            const m = String(v).toLowerCase();
            if (m === 'peso_reps' || m === 'peso-reps') return 'weight_reps';
            if (m === 'tiempo' || m === 'time') return 'time';
            if (m === 'distancia') return 'distance';
            return m;
          };
          const mapMovementPattern = (v) => {
            if (!v) return 'other';
            return String(v).toLowerCase();
          };

          const toPayload = (d) => ({
            name: d.name || d.nombre,
            media_url: d.media_url || d.mediaUrl || d.media,
            difficulty: mapDifficulty(d.difficulty || d.dificultad),
            muscle_group: d.muscle_group || d.muscleGroup || d.grupo_muscular_principal || d.grupo,
            secondary_muscle_groups: d.secondary_muscle_groups || d.musculos_secundarios || d.secondaryMuscles || [],
            equipment: Array.isArray(d.equipment) ? d.equipment : (typeof d.equipment === 'string' ? d.equipment.split(',').map(s => s.trim()).filter(Boolean) : d.equipamiento || []),
            recordType: mapRecordType(d.recordType || d.tipo_registro),
            mechanics: mapMechanics(d.mechanics || d.mecanica),
            movement_pattern: mapMovementPattern(d.movement_pattern || d.patron_movimiento),
            instructions: d.instructions || d.instrucciones || []
          });

          if (Array.isArray(body)) {
            const payloads = body.map(toPayload);
            const { created, skipped } = await ExerciceModel.create(payloads);
            return res.status(201).json({ message: `Ejercicios creados: ${created.length}, omitidos por duplicado: ${skipped}`, exercices: created });
          }

          const payload = toPayload(body);
          const { created, skipped } = await ExerciceModel.create(payload);
          if (skipped) return res.status(409).json({ message: "El ejercicio ya existe" });
          return res.status(201).json({ message: "Ejercicio creado:", exercice: created[0] });
      } catch (error) {
          res.status(500).json({ message: "Error al crear el ejercicio", error: error.message });
      }
    }

    static async updateExercice(req, res) {
      try {
        const d = req.body;
        if (!d) return res.status(400).json({ message: "Datos de ejercicio no válidos" });

        const mapDifficulty = (v) => {
          if (!v) return undefined;
          const m = String(v).toLowerCase();
          if (m === 'principiante') return 'easy';
          if (m === 'intermedio') return 'medium';
          if (m === 'avanzado') return 'hard';
          return m;
        };
        const mapMechanics = (v) => {
          if (!v) return undefined;
          const m = String(v).toLowerCase();
          if (m === 'compuesto') return 'compound';
          if (m === 'aislado') return 'isolation';
          return m;
        };
        const mapRecordType = (v) => {
          if (!v) return undefined;
          const m = String(v).toLowerCase();
          if (m === 'peso_reps' || m === 'peso-reps') return 'weight_reps';
          if (m === 'tiempo' || m === 'time') return 'time';
          if (m === 'distancia') return 'distance';
          return m;
        };
        const mapMovementPattern = (v) => {
           if (!v) return 'other';
           return String(v).toLowerCase();
        };

          const payload = {
            name: d.name || d.nombre,
            media_url: d.media_url || d.mediaUrl || d.media,
            difficulty: mapDifficulty(d.difficulty || d.dificultad),
            muscle_group: d.muscle_group || d.muscleGroup || d.grupo_muscular_principal || d.grupo,
            secondary_muscle_groups: d.secondary_muscle_groups || d.musculos_secundarios || d.secondaryMuscles || [],
            equipment: Array.isArray(d.equipment) ? d.equipment : (typeof d.equipment === 'string' ? d.equipment.split(',').map(s => s.trim()).filter(Boolean) : d.equipamiento || []),
            recordType: mapRecordType(d.recordType || d.tipo_registro),
            mechanics: mapMechanics(d.mechanics || d.mecanica),
            movement_pattern: mapMovementPattern(d.movement_pattern || d.patron_movimiento),
            instructions: d.instructions || d.instrucciones || []
          };

          const updatedExercice = await ExerciceModel.updateById(req.params.id, payload);
          if (!updatedExercice) {
            return res.status(404).json({ message: "Ejercicio no encontrado" });
          }
          return res.status(200).json({ message: "Ejercicio actualizado:", exercice: updatedExercice });
      } catch (error) {
        res.status(500).json({ message: "Error al actualizar el ejercicio", error: error.message });
      }
    }

    static async deleteExercice(req, res) {
      try {
          const deletedExercice = await ExerciceModel.deleteById(req.params.id);
          if (!deletedExercice) {
              return res.status(404).json({ message: "Ejercicio no encontrado" });
          }
          return res.status(200).json({ message: "Ejercicio eliminado:", exercice: deletedExercice });
      } catch (error) {
          res.status(500).json({ message: "Error al eliminar el ejercicio", error: error.message });
      }
    }

    static async createCustomExercice(req, res) {
      try {
          const body = req.body;
          if (!body || !body.name || !body.muscle_group) {
              return res.status(400).json({ message: "Nombre y grupo muscular son obligatorios" });
          }

          if (!req.user?.id) {
              return res.status(401).json({ message: "Usuario no autenticado" });
          }

          const mapDifficulty = (v) => {
            if (!v) return 'medium';
            const m = String(v).toLowerCase();
            if (m === 'principiante') return 'easy';
            if (m === 'intermedio') return 'medium';
            if (m === 'avanzado') return 'hard';
            return m;
          };
          const mapMechanics = (v) => {
            if (!v) return 'compound';
            const m = String(v).toLowerCase();
            if (m === 'compuesto') return 'compound';
            if (m === 'aislado') return 'isolation';
            return m;
          };
          const mapRecordType = (v) => {
            if (!v) return 'weight_reps';
            const m = String(v).toLowerCase();
            if (m === 'peso_reps' || m === 'peso-reps') return 'weight_reps';
            if (m === 'tiempo' || m === 'time') return 'time';
            if (m === 'distancia') return 'distance';
            return m;
          };

          const payload = {
            name: body.name,
            media_url: body.media_url || null,
            difficulty: mapDifficulty(body.difficulty),
            muscle_group: body.muscle_group,
            secondary_muscle_groups: body.secondary_muscle_groups || [],
            equipment: Array.isArray(body.equipment) ? body.equipment : [],
            recordType: mapRecordType(body.recordType),
            mechanics: mapMechanics(body.mechanics),
            instructions: body.instructions || [],
            userId: req.user.id,
          };

          const newExercice = await ExerciceModel.createCustom(payload);
          return res.status(201).json({ message: "Ejercicio personalizado creado:", exercice: newExercice });
      } catch (error) {
          res.status(500).json({ message: "Error al crear el ejercicio personalizado", error: error.message });
      }
    }
}