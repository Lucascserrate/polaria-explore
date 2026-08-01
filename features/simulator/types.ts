/** Contratos del simulador. La UI no conoce otra fuente de verdad que ésta. */

export type Sender = "client" | "polaria";

export type ConfirmationCard = {
  service: string;
  day: string;
  time: string;
  price: string;
  staff: string;
};

/**
 * Una opción tocable dentro de un mensaje.
 *
 * Representa lo que WhatsApp llama mensajes interactivos: botones de respuesta
 * y mensajes de lista. Es el diferencial de la reserva guiada, así que la demo
 * tiene que mostrarlo y no esconderlo detrás de texto libre.
 */
export type ChatAction = {
  /** Identificador estable, ej. "barber:martin". El motor transiciona por esto. */
  id: string;
  label: string;
  /** Sólo en listas: la línea secundaria de cada fila. */
  description?: string;
};

export type Interactive =
  | { kind: "buttons"; actions: ChatAction[] }
  | { kind: "list"; title: string; actions: ChatAction[] };

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  /** Hora mostrada, ej. "22:14". Fija y determinista: evita desajustes de hidratación. */
  time: string;
  card?: ConfirmationCard;
  interactive?: Interactive;
  /** Se apaga cuando ya se eligió una opción, para que no se pueda tocar dos veces. */
  actionsResolved?: boolean;
};

export type SlotState = "free" | "busy" | "justBooked";

export type AgendaSlot = {
  time: string;
  state: SlotState;
  /** Detalle cuando está ocupado, ej. "Corte + barba · Diego". */
  label?: string;
};

export type BarberId = string;

export type Barber = {
  id: BarberId;
  name: string;
  role: string;
};

export type AlertKind = "handoff" | "booked" | "moved" | "cancelled";

export type OwnerAlert = {
  id: string;
  kind: AlertKind;
  text: string;
  time: string;
  /** Sobre qué agenda ocurrió, para poder señalarla en el panel. */
  barberId?: BarberId;
};

/**
 * Efectos secundarios de un turno de conversación.
 *
 * `handoff` no es un error: es la derivación a humano, una función real del
 * producto. Es lo que vuelve la demo irrompible — cualquier mensaje que el
 * matcher no reconozca termina demostrando una capacidad en vez de fallar.
 */
export type Effect =
  | {
      type: "appointment.created";
      slot: string;
      service: string;
      barberId: BarberId;
    }
  | { type: "appointment.moved"; from: string; to: string; barberId: BarberId }
  | { type: "appointment.cancelled"; slot: string; barberId: BarberId }
  | { type: "handoff"; reason: string }
  /** Mueve el panel derecho a la agenda de un profesional. */
  | { type: "barber.focus"; barberId: BarberId };

/** Paso del flujo guiado. `null` significa conversación libre. */
export type FlowStep = null | "menu" | "service" | "barber" | "slot";

/** Memoria de la conversación. Es lo que permite turnos encadenados creíbles. */
export type SimContext = {
  greeted: boolean;
  hasAppointment: boolean;
  bookedSlot: string | null;
  bookedService: string | null;
  bookedBarberId: BarberId | null;
  /** Horarios que Polaria acaba de ofrecer y está esperando que se elija uno. */
  offeredSlots: string[];
  flowStep: FlowStep;
  selectedServiceKey: string | null;
  /** `null` mientras no se eligió; "any" cuando la persona dijo "sin preferencia". */
  selectedBarberId: BarberId | "any" | null;
  /** true si el próximo horario elegido reemplaza a una cita existente. */
  movingAppointment: boolean;
};

export type OutgoingMessage = {
  text: string;
  /** Milisegundos de "escribiendo…" antes de que aparezca este mensaje. */
  typingMs?: number;
  card?: ConfirmationCard;
  interactive?: Interactive;
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
  /** Una agenda por profesional: es lo que prueba que Polaria gestiona agendas. */
  agendas: Record<BarberId, AgendaSlot[]>;
  /** Qué agenda muestra el panel derecho. */
  activeBarberId: BarberId;
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
  /** Cierre con captura de contacto, aparece tras la primera cita confirmada. */
  outroVisible: boolean;
};
