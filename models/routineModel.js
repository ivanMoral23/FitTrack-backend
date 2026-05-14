import mongoose from 'mongoose';

const routineExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercice',
    required: true
  },
  sets: { type: Number, default: 3, min: 1 },
  reps: { type: Number, default: 10, min: 1 },
}, { _id: false });

const routineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Puede ser null para rutinas del sistema
  },
  name: {
    type: String,
    required: true,
  },
  focus: [{
    type: String, // e.g., 'Pecho', 'Tríceps', 'Espalda'
  }],
  exercises: [routineExerciseSchema],
  isSystemRoutine: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Routine = mongoose.models.Routine || mongoose.model('Routine', routineSchema);

export class RoutineModel {
  static async createRoutine(data) {
    return Routine.create(data);
  }

  static async getByUserId(userId) {
    return Routine.find({ userId }).sort({ createdAt: -1 }).populate('exercises.exerciseId');
  }

  static async getRecommendations() {
    return Routine.find({ isSystemRoutine: true }).populate('exercises.exerciseId');
  }

  static async deleteByIdAndUser(routineId, userId) {
    return Routine.findOneAndDelete({ _id: routineId, userId });
  }

  // Utilidad para inyectar recomendaciones iniciales si la DB está vacía
  static async spawnDefaultRoutines(defaultRoutines) {
    const existing = await Routine.countDocuments({ isSystemRoutine: true });
    if (existing === 0) {
      await Routine.insertMany(defaultRoutines);
      console.log('Rutinas del sistema creadas.');
    }
  }
}
