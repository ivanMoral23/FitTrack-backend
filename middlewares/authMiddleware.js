import jwt from 'jsonwebtoken'

// Este middleware se encarga de verificar que el usuario esté autenticado antes de permitirle acceder a ciertas rutas protegidas.
// Verifica el token JWT enviado en las cookies y, si es válido, adjunta la información del usuario al objeto `req` para que pueda
// ser utilizada en los controladores.

export const authMiddleware = (req, res, next) => {
  // Allow CORS preflight through
  if (req.method === 'OPTIONS') return next();

  // Extraemos token de varias fuentes (cabeceras, x-access-token, cookies,
  // query o body) para ser compatibles con clientes móviles (Flutter) y web.
  // Try several header names/variants
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader) {
    // Soportar 'Bearer <token>' en mayúsculas/minúsculas y también raw token
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') token = parts[1].trim();
    else token = authHeader.trim();
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
    else token = authHeader.trim(); // accept raw token without Bearer
  }

  token = token || req.headers['x-access-token'] || req.headers['x-auth-token'];

  // Also accept token from query string or JSON body (some mobile clients use this)
  token = token || req.query?.token || req.body?.token;

  // Fallback: check parsed cookies (if cookie-parser is used) or raw cookie header
  if (!token) {
    if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
      token = req.cookies.token || req.cookies.jwt;
    } else if (req.headers.cookie) {
      const pairs = req.headers.cookie.split(';').map(p => p.trim());
      for (const p of pairs) {
        if (p.startsWith('token=') || p.startsWith('jwt=')) {
          token = p.split('=')[1];
          break;
        }
      }
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token válido no proporcionado o inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ message });
  }
};

// Es un middleware muy simple pero dificil de tratar en el front, ya que funciona algo diferente en Flutter que en navegador. Quizás según 
// vayamos avanzando igual cambiamos a OAuth o algo asi y entonces se trataran como si fueran de navegador.

