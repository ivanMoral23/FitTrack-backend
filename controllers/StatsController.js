import { generateInsight } from '../services/InsightService.js';
import { InsightModel } from '../models/insightModel.js';
import mongoose from 'mongoose';

export class StatsController {
  static async syncStats(req, res) {
    try {
      const { steps, sleep_hours, screen_time_minutes, gravity_index } = req.body;
      const userId = req.user.id;

      console.log(`DEBUG: [StatsController] Buscando resumen para usuario ID: ${userId}`);

      if (
        typeof steps !== 'number' ||
        typeof sleep_hours !== 'number' ||
        typeof screen_time_minutes !== 'number' ||
        typeof gravity_index !== 'number'
      ) {
        return res.status(400).json({ message: 'Payload inválido.' });
      }

      const clampedIndex = Math.min(100, Math.max(0, gravity_index));
      let daily_insight = "";

      try {
        // Buscamos forzando el tipo ObjectId para evitar errores de búsqueda
        const latestInsight = await InsightModel.findOne({ 
          userId: new mongoose.Types.ObjectId(userId) 
        })
        .sort({ createdAt: -1 })
        .exec();
        
        if (latestInsight) {
          console.log(`DEBUG: [StatsController] Resumen encontrado: "${latestInsight.message.substring(0, 30)}..."`);
          daily_insight = latestInsight.message;
        } else {
          console.log(`DEBUG: [StatsController] No se encontró resumen real en DB para este usuario.`);
          daily_insight = generateInsight(clampedIndex);
        }
      } catch (dbErr) {
        console.error("DEBUG: [StatsController] Error en búsqueda DB:", dbErr.message);
        daily_insight = generateInsight(clampedIndex);
      }

      return res.status(200).json({
        daily_insight,
        gravity_index: clampedIndex,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error al procesar las estadísticas.',
        error: error.message,
      });
    }
  }
}
