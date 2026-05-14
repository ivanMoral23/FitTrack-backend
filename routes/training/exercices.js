import { Router } from 'express'
import { ExerciceController } from '../../controllers/ExerciceController.js';


export const ExercicesRouter = Router()

ExercicesRouter.post('/create', ExerciceController.createExercice)
ExercicesRouter.post('/create-custom', ExerciceController.createCustomExercice)

ExercicesRouter.get('/getAll', ExerciceController.getAllExercices)
ExercicesRouter.get('/getById/:id', ExerciceController.getExerciceById)
ExercicesRouter.get('/getByMuscleGroup/:muscleGroup', ExerciceController.getExercicesByMuscleGroup)
ExercicesRouter.get('/getByName/:name', ExerciceController.getExercicesByName)

ExercicesRouter.put('/update/:id', ExerciceController.updateExercice)
ExercicesRouter.delete('/delete/:id', ExerciceController.deleteExercice)
