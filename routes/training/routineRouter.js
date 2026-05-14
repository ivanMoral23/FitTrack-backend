import { Router } from 'express';
import { RoutineController } from '../../controllers/RoutineController.js';

export const RoutineRouter = Router();

RoutineRouter.post('/create', RoutineController.createRoutine);
RoutineRouter.post('/generate-ai', RoutineController.generateAiRoutine);
RoutineRouter.get('/my-routines', RoutineController.getMyRoutines);
RoutineRouter.get('/recommendations', RoutineController.getRecommendations);
RoutineRouter.delete('/:id', RoutineController.deleteRoutine);
