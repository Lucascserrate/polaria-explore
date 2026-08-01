/**
 * Ritmo del simulador.
 *
 * Todos los tiempos de la demo salen de acá. Antes estaban repartidos entre el
 * motor (`engine/graph.ts`), el guion (`data/autoplay.ts`) y el orquestador
 * (`hooks/useSimulator.ts`), así que ajustar la velocidad obligaba a tocar tres
 * archivos y adivinar cómo se sumaban.
 *
 * Si la conversación se siente apurada o lenta, mover `PACE` y nada más.
 */

/**
 * Multiplicador global. 1 es el ritmo original; más alto, más pausado.
 *
 * La demo tiene que poder leerse: cada opción del flujo guiado es una lista de
 * WhatsApp que hay que recorrer con la vista antes de que el guion la toque.
 */
export const PACE = 1.6;

/** Aplica el multiplicador y redondea, para no arrastrar decimales a los timers. */
export const beat = (ms: number) => Math.round(ms * PACE);

/**
 * "Escribiendo…" de un mensaje conversacional: crece con el largo del texto,
 * porque un mensaje largo tarda más en escribirse.
 */
export const conversationalTypingMs = (length: number) =>
  beat(Math.min(1500, 420 + length * 11));

/**
 * "Escribiendo…" de un paso del flujo guiado. Más corto a propósito: un Flow
 * real responde casi al instante, no simula estar tipeando.
 */
export const flowTypingMs = (length: number) => beat(Math.min(780, 340 + length * 6));

export const pacing = {
  /** Fallback cuando un mensaje no trae su propio `typingMs`. */
  typingFallback: beat(800),
  /**
   * Respiro entre el mensaje con la tarjeta de confirmación y el movimiento de
   * la agenda: primero se lee el chat, después se mira el panel del dueño.
   */
  beforeEffects: beat(340),
  /** Pausa entre dos mensajes seguidos de Polaria. */
  betweenMessages: beat(280),
  /** Milisegundos por carácter mientras el guion "tipea" en el compositor. */
  typeCharMs: beat(30),
  /** Pausa entre terminar de tipear y enviar, como quien relee antes de mandar. */
  beforeSend: beat(260),
  /** Tope de cualquier espera cuando la persona pidió menos movimiento. */
  reducedMotionMax: 30,
} as const;
