import { Router } from 'express';
import { FoodController } from '../../controllers/FoodController.js';

export const FoodRouter = Router();

FoodRouter.get('/search', FoodController.search);
