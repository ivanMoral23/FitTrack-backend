import { Router } from 'express'
import { UserController } from '../controllers/UserController.js';

export const LoginRouter = Router()

LoginRouter.post('/', UserController.login)
