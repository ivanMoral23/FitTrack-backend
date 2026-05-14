import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';

export const VerifyRouter = Router();

VerifyRouter.get('/:token', UserController.verifyEmail);
