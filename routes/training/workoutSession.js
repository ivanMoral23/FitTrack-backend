import { Router } from 'express'
import { WorkoutSessionController } from '../../controllers/WorkoutSessionController.js'

export const WorkoutSessionRouter = Router()

WorkoutSessionRouter.post('/create', WorkoutSessionController.createSession)
WorkoutSessionRouter.get('/getAll', WorkoutSessionController.getAllSessions)
WorkoutSessionRouter.get('/my-sessions', WorkoutSessionController.getMySessions)
WorkoutSessionRouter.get('/getById/:id', WorkoutSessionController.getSessionById)
WorkoutSessionRouter.get('/getByUser/:userId', WorkoutSessionController.getSessionByUser)
WorkoutSessionRouter.delete('/delete/:id', WorkoutSessionController.deleteSession)
