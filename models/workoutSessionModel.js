
import mongoose from 'mongoose'

const setSchema = new mongoose.Schema({
  reps: { type: Number },
  peso: { type: Number },
  tiempo: { type: Number },
  completado: { type: Boolean, default: true }
}, { _id: false })

const workoutExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercice',
    required: true
  },
  series: [setSchema]
}, { _id: false })

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombre_rutina: {
    type: String,
    required: true,
    default: 'Entrenamiento libre'
  },
  fecha: { type: Date, default: Date.now },
  duracion_minutos: { type: Number },
  volumen_total: { type: Number },
  ejercicios_realizados: [workoutExerciseSchema]
}, { timestamps: true })

const WorkoutSession = mongoose.models.WorkoutSession || mongoose.model('WorkoutSession', workoutSessionSchema)

export default class WorkoutSessionModel {
  static async create(payload) {
    if (Array.isArray(payload)) {
      return WorkoutSession.insertMany(payload)
    }
    return WorkoutSession.create(payload)
  }
  // Inutil
  static async getAll() {
    return WorkoutSession.find({}).populate('userId').populate('ejercicios_realizados.exerciseId')
  }
  // Poco útil
  static async getById(id) {
    return WorkoutSession.findById(id).populate('userId').populate('ejercicios_realizados.exerciseId')
  }
  // Útil
  static async getByUser(userId) {
    return WorkoutSession.find({ userId }).populate('ejercicios_realizados.exerciseId')
  }
  // Inutil
  static async updateById(id, data) {
    return WorkoutSession.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  }
  // Inutil
  static async deleteById(id) {
    return WorkoutSession.findByIdAndDelete(id)
  }
}
