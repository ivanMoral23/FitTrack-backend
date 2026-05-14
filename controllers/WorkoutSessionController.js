import WorkoutSessionModel from "../models/workoutSessionModel.js"


export class WorkoutSessionController {
  // Crear nueva sesión de entrenamiento, una por cada vez que le de a "empezar entreno".
  static async createSession(req, res) {
    try {
      const body = req.body
      if (!body) return res.status(400).json({ message: "Datos de sesión no válidos" })

      body.userId = req.user.id; // Associate session with authenticated user

      const created = await WorkoutSessionModel.create(body)
      return res.status(201).json({ message: "Sesión creada:", session: created })
    } catch (error) {
      return res.status(500).json({ message: "Error al crear la sesión", error: error.message })
    }
  }

  // Este no tiene mucho sentido, pero para que este.
  static async getAllSessions(req, res) {
    try {
      const sessions = await WorkoutSessionModel.getAll()
      return res.status(200).json({ message: "Sesiones obtenidas:", sessions })
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener sesiones", error: error.message })
    }
  }

  static async getSessionById(req, res) {
    try {
      const session = await WorkoutSessionModel.getById(req.params.id)
      if (!session) return res.status(404).json({ message: "Sesión no encontrada" })
      return res.status(200).json({ message: "Sesión obtenida:", session })
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener sesión", error: error.message })
    }
  }
  // Este sera el más útil, para obtener las sesiones de un usuario concreto.
  static async getSessionByUser(req, res) {
    try {
      const userId = req.params.userId
      const sessions = await WorkoutSessionModel.getByUser(userId)
      return res.status(200).json({ message: "Sesiones del usuario:", sessions })
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener sesiones por usuario", error: error.message })
    }
  }

  // Obtener las sesiones del usuario autenticado (desde el token)
  static async getMySessions(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) return res.status(401).json({ message: "Usuario no autenticado" });
      const sessions = await WorkoutSessionModel.getByUser(userId);
      return res.status(200).json({ message: "Mis sesiones:", sessions });
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener mis sesiones", error: error.message });
    }
  }
  // No creo que se use mucho, pero por si acaso, para eliminar sesiones.
  static async deleteSession(req, res) {
    try {
      const deleted = await WorkoutSessionModel.deleteById(req.params.id)
      if (!deleted) return res.status(404).json({ message: "Sesión no encontrada" })
      return res.status(200).json({ message: "Sesión eliminada:", session: deleted })
    } catch (error) {
      return res.status(500).json({ message: "Error al eliminar sesión", error: error.message })
    }
  }
}

export default WorkoutSessionController
