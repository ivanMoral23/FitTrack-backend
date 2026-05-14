// Colecciones de mensajes motivadores por rango de Gravity Index.
// Se elige uno aleatorio dentro del rango correspondiente.

const INSIGHTS = {
  high: [
    'Tu energía hoy es imparable. El cuerpo que cuidas te lo devuelve con creces.',
    'Eres antigravedad pura. Sigue así y el mundo no podrá retenerte.',
    'Pasos, sueño y balance digital: la trinidad perfecta. Hoy vuelas.',
    'Tu cuerpo ha logrado el equilibrio que muy pocos alcanzan. Disfruta la ligereza.',
    'El descanso fue tuyo, los pasos también. Así se escribe la fuerza.',
  ],
  mid: [
    'Vas bien, pero hay margen para elevarte más. Un paseo extra puede marcar la diferencia.',
    'Equilibrio en proceso. Cada paso cuenta más de lo que crees.',
    'Ni muy alto ni muy bajo: es el momento perfecto para dar un empujón al día.',
    'La órbita es tuya si reduces 20 minutos de pantalla esta tarde.',
    'Mitad del camino. Tu cuerpo sabe que puede más; dale la oportunidad.',
  ],
  low: [
    'Hoy la gravedad pesa, pero no te define. Incluso 10 minutos de caminata cambian el índice.',
    'El móvil ha ganado hoy, pero mañana vuelves tú. Empieza con una noche de sueño real.',
    'Tu cuerpo pide movimiento. No hace falta mucho: levántate, estírate, respira.',
    'Los días pesados también cuentan. Reconocer la fatiga es el primer paso para superarla.',
    'La gravedad existe para ser desafiada. Una pequeña acción ahora pone en marcha el cambio.',
  ],
};

/**
 * Genera un daily_insight basado en el gravity_index recibido.
 * @param {number} gravityIndex - Valor entre 0 y 100.
 * @returns {string} Mensaje motivador.
 */
export function generateInsight(gravityIndex) {
  let pool;
  if (gravityIndex >= 65) {
    pool = INSIGHTS.high;
  } else if (gravityIndex >= 35) {
    pool = INSIGHTS.mid;
  } else {
    pool = INSIGHTS.low;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
