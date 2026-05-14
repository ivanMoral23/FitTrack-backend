import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['training', 'nutrition', 'motivation', 'general'], default: 'general' }
}, { timestamps: true });

export const InsightModel = mongoose.models.Insight || mongoose.model('Insight', insightSchema);
