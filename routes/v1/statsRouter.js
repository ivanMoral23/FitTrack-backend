import { Router } from 'express';
import { StatsController } from '../../controllers/StatsController.js';

export const StatsRouter = Router();

// POST /api/v1/sync-stats
StatsRouter.post('/sync-stats', StatsController.syncStats);
