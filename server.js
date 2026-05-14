import 'dotenv/config';
import express from 'express';
import https from 'https';
import fs from 'fs';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { corsMiddleware } from './middlewares/cors.js';
import { connectDB } from './config/db.js';
import { RegisterRouter } from './routes/register.js';
import { LoginRouter } from './routes/login.js';
import { ExercicesRouter } from './routes/training/exercices.js';
import { WorkoutSessionRouter } from './routes/training/workoutSession.js';
import { RoutineRouter } from './routes/training/routineRouter.js';
import { FoodRouter } from './routes/food/foodRouter.js';
import { ChatRouter } from './routes/chat.js';
import { VerifyRouter } from './routes/verify.js';
import { AuthRouter } from './routes/auth.js';
import { StatsRouter } from './routes/v1/statsRouter.js';
import { InsightRouter } from './routes/insightRouter.js';

const app = express();

const PORT = process.env.PORT ?? 3000;
const HTTPS_PORT = process.env.HTTPS_PORT ?? 8443;
app.disable('x-powered-by'); // Seguridad, ocultamos que usamos express
app.use(express.json()); // Middleware para parsear el body de las peticiones como JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear formularios HTML
app.use(corsMiddleware()); // Middleware para controlar el CORS, permitiendo solo ciertos orígenes (los nuestros) !!!SI HACEMOS FLUTTER WEB!!!.

// Aqui irán nuestras rutas, separandolas en 3 capas mvc: modelo, vista y controlador (nuestra vista es Flutter)
// Es muy util verse el conjunto de videos de nodejs de midudev: https://www.youtube.com/watch?v=yB4n_K7dZV8&list=PLUofhDIg_38qm2oPOV-IRTTEKyrVBBaU7
// Si os da mucho palo ver los videos, al menos mirad el 2, 4 y 5.
// No empezeis a chatgptear sin idea, sobre todo por temas de arquitectura. Más adelante os haré un ejemplo de como hacer alguna rama
// con enrutamiento con routers y como controlar el tema de las abstracciones entre capas.
// No esta mal lo que enseñan en la práctica 3 de PTI, pero no es suficientemente abstracto.
// Ánimo que lo haremos de puta madre.

connectDB(); // Conectamos a la base de datos al iniciar el servidor

app.use('/register', RegisterRouter)
app.use('/login', LoginRouter)
app.use('/verify', VerifyRouter)
app.use('/exercices', authMiddleware, ExercicesRouter) // Rutas de ejercicios, protegidas por el middleware de autenticación
app.use('/user-workouts', authMiddleware, WorkoutSessionRouter) // Rutas de historial de entrenamiento
app.use('/routines', authMiddleware, RoutineRouter) // Rutas de plantillas/recomendaciones de entrenamiento
app.use('/api/food', authMiddleware, FoodRouter) // Búsqueda de alimentos via USDA FoodData Central
app.use('/chat', authMiddleware, ChatRouter) // Ruta protegida para el chatbot
app.use('/insights', authMiddleware, InsightRouter) // Dashboard muro de la IA
app.use('/auth', AuthRouter) // Rutas de autenticación avanzada (reset password, etc)
app.use('/api/v1', authMiddleware, StatsRouter) // Estadísticas diarias y daily insight


// Health check endpoint for CI/CD and Docker container monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});




// HTTP server (kept for backward compatibility)
app.listen(PORT, () => {
  console.log(`HTTP  server running on port ${PORT}`);
});

// HTTPS server
try {
  const tlsOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
  };
  https.createServer(tlsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
  });
} catch (err) {
  console.warn(`HTTPS not started: ${err.message}`);
}