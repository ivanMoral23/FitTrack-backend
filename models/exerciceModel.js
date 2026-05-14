import mongoose from 'mongoose';

const exerciceSchema = new mongoose.Schema({
    name: { type: String, required: true},
    media_url: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    muscle_group: { type: String, required: true },
    secondary_muscle_groups: [{ type: String }],
    equipment: [{ type: String }],
    recordType: { type: String, enum: ['weight_reps', 'time', 'distance'], default: 'weight_reps' },
    mechanics: { type: String, enum: ['compound', 'isolation'], default: 'compound' },
    movement_pattern: { type: String, enum: ['horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'squat', 'hinge', 'lunge', 'isolation_curl', 'isolation_extension', 'core_stability', 'dynamic', 'other'], default: 'other' },
    instructions: [{ type: String }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  }, { timestamps: true });

const Exercice = mongoose.models.Exercice || mongoose.model('Exercice', exerciceSchema);

// Helper: escape regex special chars
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

// Map base letters to accented variants for common Latin characters
const ACCENT_MAP = {
  a: 'aàáâãäåā',
  e: 'eèéêëē',
  i: 'iìíîïī',
  o: 'oòóôõöō',
  u: 'uùúûüū',
  c: 'cç',
  n: 'nñ',
  y: 'yÿý'
};

function buildAccentInsensitivePattern(str) {
  const parts = [];
  for (const ch of str) {
    const lower = ch.toLowerCase();
    if (ACCENT_MAP[lower]) {
      // create a character class with all variants
      const chars = ACCENT_MAP[lower];
      parts.push('[' + chars.replace(/[-\\]\\]/g, '\\$&') + ']');
    } else {
      parts.push(escapeRegExp(ch));
    }
  }
  return parts.join('');
}

function accentInsensitiveRegExp(str) {
  return new RegExp(buildAccentInsensitivePattern(str), 'i');
}

class ExerciceModel {
  static async getAll() {
    return Exercice.find({});
  }

  static async getById(id) {
    return Exercice.findById(id);
  }

  static async getByMuscleGroup(muscleGroup, userId = null) {
    const re = accentInsensitiveRegExp(muscleGroup);
    const query = userId
      ? { muscle_group: re, $or: [{ userId: null }, { userId }] }
      : { muscle_group: re, userId: null };
    return Exercice.find(query);
  }

  static async getByName(name) {
    const re = accentInsensitiveRegExp(name);
    return Exercice.find({ name: re });
  }

  static async create(data) {
    if (Array.isArray(data)) {
      const existingNames = (await Exercice.find({ userId: null }).select('name').lean())
        .map(e => e.name.toLowerCase());
      const toInsert = data.filter(d => !existingNames.includes((d.name || '').toLowerCase()));
      const skipped = data.length - toInsert.length;
      const created = toInsert.length > 0 ? await Exercice.create(toInsert) : [];
      return { created, skipped };
    }
    const exists = await Exercice.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(data.name)}$`, 'i') }, userId: null });
    if (exists) return { created: [], skipped: 1 };
    const { name, media_url, difficulty, muscle_group, secondary_muscle_groups, equipment, recordType, mechanics, instructions } = data;
    const doc = await Exercice.create({ name, media_url, difficulty, muscle_group, secondary_muscle_groups, equipment, recordType, mechanics, instructions });
    return { created: [doc], skipped: 0 };
  }

  static async createCustom({ name, media_url, difficulty, muscle_group, secondary_muscle_groups, equipment, recordType, mechanics, instructions, userId }) {
    return Exercice.create({ name, media_url, difficulty, muscle_group, secondary_muscle_groups, equipment, recordType, mechanics, instructions, userId });
  }

  static async updateById(id, exerciceData) {
    return Exercice.findByIdAndUpdate(id, exerciceData, { new: true });
  }

  static async deleteById(id) {
    return Exercice.findByIdAndDelete(id);
  }
}

export default ExerciceModel;