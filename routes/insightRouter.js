import { Router } from 'express';
import { InsightController } from '../controllers/InsightController.js';

export const InsightRouter = Router();

InsightRouter.get('/', InsightController.getInsights);
InsightRouter.post('/trigger', InsightController.triggerManualAgent);
InsightRouter.post('/recommendation', InsightController.getMuscleRecommendation);
