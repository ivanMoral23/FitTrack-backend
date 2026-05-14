import cors from 'cors'

// Permite todas las peticiones momentaneamente.
export const corsMiddleware = () => cors({
  origin: '*'
})
