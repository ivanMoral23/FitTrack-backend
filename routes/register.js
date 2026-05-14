import { Router } from 'express'
import { UserController } from '../controllers/UserController.js';

export const RegisterRouter = Router()


RegisterRouter.post('/', UserController.create)
