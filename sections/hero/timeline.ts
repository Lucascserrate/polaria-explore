import { heroChat, type ChatStep } from "@/content/hero-chat";

/**
 * El guion del hero, compilado a una lista plana de fotogramas.
 *
 * La animación es un único índice que avanza con un `setTimeout`. Todo lo que
 * se ve en pantalla se deriva de ese índice, así que no hay estado acumulado
 * que pueda desincronizarse, reiniciar es volver a 0, y "movimiento reducido"
 * es saltar al último fotograma.
 */

/**
 * Multiplicador global del ritmo. 1 es el ritmo diseñado; más alto, más
 * pausado. Si la demo se siente apurada o lenta, mover esto y nada más.
 *
 * El criterio: cada paso tiene que poder leerse entero antes de que el guion
 * lo toque, incluida la lista de servicios con sus precios.
 */
const PACE = 1;

const beat = (ms: number) => Math.round(ms * PACE);

const pacing = {
  /** "Escribiendo…" antes de cada mensaje de Polaria. Crece con el texto. */
  typingBase: 400,
  typingPerChar: 11,
  typingMax: 1150,

  /** Tiempo de lectura del mensaje: texto, opciones y filas de la tarjeta. */
  readBase: 900,
  readPerChar: 10,
  readPerOption: 280,
  readPerCardRow: 140,
  readMax: 3400,

  /** Del mensaje a la opción tocada, y de la opción a la respuesta. */
  afterPick: 620,
  afterReply: 520,

  /** Pausa con la reserva confirmada en pantalla antes de volver a empezar. */
  restart: 4200,
} as const;

function typingMs(step: ChatStep) {
  return beat(
    Math.min(
      pacing.typingMax,
      pacing.typingBase + step.text.length * pacing.typingPerChar,
    ),
  );
}

function readMs(step: ChatStep) {
  const attach = step.attach;
  const options = attach
    ? attach.kind === "card"
      ? (attach.items?.length ?? 0)
      : attach.items.length
    : 0;
  const cardRows = attach?.kind === "card" ? attach.rows.length : 0;

  return beat(
    Math.min(
      pacing.readMax,
      pacing.readBase +
        step.text.length * pacing.readPerChar +
        options * pacing.readPerOption +
        cardRows * pacing.readPerCardRow,
    ),
  );
}

export type Frame =
  /** Los tres puntos de Polaria. */
  | { kind: "typing"; ms: number }
  /** Aparece el mensaje del paso (con sus opciones, si tiene). */
  | { kind: "say"; step: number; ms: number }
  /** Se marca la opción elegida y se apagan las demás. */
  | { kind: "pick"; step: number; ms: number }
  /** Aparece la respuesta del cliente. */
  | { kind: "reply"; step: number; ms: number };

/** Dónde cae cada momento de un paso dentro de la lista de fotogramas. */
export type StepCue = { say: number; pick?: number; reply?: number };

function build() {
  const frames: Frame[] = [];
  const cues: StepCue[] = [];

  heroChat.steps.forEach((step, index) => {
    if (step.from === "polaria") {
      frames.push({ kind: "typing", ms: typingMs(step) });
    }

    const say = frames.push({ kind: "say", step: index, ms: readMs(step) }) - 1;
    const cue: StepCue = { say };

    if (step.pick) {
      cue.pick = frames.push({ kind: "pick", step: index, ms: pacing.afterPick }) - 1;
      cue.reply =
        frames.push({ kind: "reply", step: index, ms: pacing.afterReply }) - 1;
    }

    cues.push(cue);
  });

  // El último fotograma sostiene la reserva en pantalla antes del reinicio.
  frames[frames.length - 1] = {
    ...frames[frames.length - 1],
    ms: beat(pacing.restart),
  };

  return { frames, cues } as const;
}

export const timeline = build();

export const LAST_FRAME = timeline.frames.length - 1;
