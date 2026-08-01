/** Contratos del simulador. La UI no conoce otra fuente de verdad que ésta. */

export type Sender = "client" | "polaria";

export type ConfirmationCard = {
  service: string;
  day: string;
  time: string;
  price: string;
  staff: string;
};

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  /** Hora mostrada, ej. "22:14". Fija y determinista: evita desajustes de hidratación. */
  time: string;
  card?: ConfirmationCard;
};

export type SlotState = "free" | "busy" | "justBooked";

export type AgendaSlot = {
  time: string;
  state: SlotState;
  /** Detalle cuando está ocupado, ej. "Corte + barba · Diego". */
  label?: string;
};

export type AlertKind = "handoff" | "booked" | "moved" | "cancelled";

export type OwnerAlert = {
  id: string;
  kind: AlertKind;
  text: string;
  time: string;
};

/**
 * Efectos secundarios de un turno de conversación.
 *
 * `handoff` no es un error: es la derivación a humano, una función real del
 * producto. Es lo que vuelve la demo irrompible — cualquier mensaje que el
 * matcher no reconozca termina demostrando una capacidad en vez de fallar.
 */
export type Effect =
  | { type: "appointment.created"; slot: string; service: string }
  | { type: "appointment.moved"; from: string; to: string }
  | { type: "appointment.cancelled"; slot: string }
  | { type: "handoff"; reason: string };

/** Memoria de la conversación. Es lo que permite turnos encadenados creíbles. */
export type SimContext = {
  greeted: boolean;
  hasAppointment: boolean;
  bookedSlot: string | null;
  bookedService: string | null;
  /** Horarios que Polaria acaba de ofrecer y está esperando que se elija uno. */
  offeredSlots: string[];
  /** Servicio en negociación mientras se elige horario. */
  pendingService: string | null;
  /** true si el próximo horario elegido reemplaza a una cita existente. */
  movingAppointment: boolean;
};

export type OutgoingMessage = {
  text: string;
  /** Milisegundos de "escribiendo…" antes de que aparezca este mensaje. */
  typingMs?: number;
  card?: ConfirmationCard;
};

/** Resultado de un turno: qué dice Polaria, qué cambia y qué sugerir después. */
export type Turn = {
  messages: OutgoingMessage[];
  effects?: Effect[];
  suggests?: string[];
  context?: Partial<SimContext>;
};

export type SimPhase = "idle" | "playing" | "live";

export type SimState = {
  phase: SimPhase;
  messages: ChatMessage[];
  typing: boolean;
  agenda: AgendaSlot[];
  alerts: OwnerAlert[];
  context: SimContext;
  suggestions: string[];
  /** Minutos desde medianoche del reloj ficticio de la conversación. */
  clock: number;
  /**
   * Contador para generar ids. Deliberadamente no usamos Math.random ni Date:
   * el render del servidor y el del cliente tienen que coincidir.
   */
  seq: number;
  /** Para el badge del panel de agenda en móvil. */
  unseenAgendaUpdates: number;
  /** Cierre con captura de email, aparece tras la primera cita confirmada. */
  outroVisible: boolean;
};
