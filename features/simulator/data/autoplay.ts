/**
 * Guion de la reproducción automática.
 *
 * Son mensajes de cliente que se escriben solos en el compositor y pasan por
 * el MISMO motor que los del visitante. No hay un camino "de demo" separado:
 * lo que se ve en el autoplay es exactamente lo que pasa si lo escribís vos.
 */
export const autoplayScript = [
  { text: "Hola", delayBefore: 700 },
  { text: "¿Tienen cita para mañana?", delayBefore: 1100 },
  { text: "14:30 me sirve", delayBefore: 1300 },
] as const;

/** Milisegundos por carácter mientras el guion "tipea". */
export const typingSpeedMs = 30;
