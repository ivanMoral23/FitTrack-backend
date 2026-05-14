# GymTracker Backend 🚀

Backend robusto para la gestión de entrenamientos y nutrición, potenciado por Inteligencia Artificial. Desarrollado originalmente como proyecto para la FIB-UPC y evolucionado hacia una solución integral de fitness.

## 🛠️ Tecnologías
- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** MongoDB (Mongoose)
- **IA:** Integración con Gemini, Groq y Cohere para insights personalizados.
- **Autenticación:** JWT (JSON Web Tokens)
- **Infraestructura:** Docker & Kubernetes (K8s)

## ✨ Funcionalidades Principales
- **Gestión de Usuarios:** Registro, login y perfiles personalizados.
- **Seguimiento de Entrenamientos:** Creación y registro de rutinas y sesiones.
- **Módulo de Nutrición:** Seguimiento de ingesta calórica y macronutrientes.
- **IA Insights:** Generación de recomendaciones personalizadas basadas en el progreso del usuario.
- **Chatbot Inteligente:** Asistente virtual para resolver dudas sobre ejercicios y dietas.

## 🚀 Instalación y Uso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/GymTracker-Backend.git
   cd GymTracker-Backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y rellena tus claves:
   ```bash
   cp .env.example .env
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 🐳 Docker
El proyecto incluye configuración para Docker Compose:
```bash
docker-compose up --build
```

---
*Desarrollado por Iván Fernández - 2026*
