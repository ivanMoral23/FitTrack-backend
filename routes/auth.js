import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const AuthRouter = Router();

AuthRouter.post('/forgot-password', UserController.requestPasswordReset);
AuthRouter.get('/reset-password/:token', UserController.showResetPasswordForm);
AuthRouter.post('/reset-password', UserController.updatePassword);
AuthRouter.put('/update-profile', authMiddleware, UserController.updateUser);
AuthRouter.put('/change-password', authMiddleware, UserController.changePassword);
