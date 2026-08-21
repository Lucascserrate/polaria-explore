/**
 * Copy del hero.
 *
 * Posicionamiento: Polaria no es "para barberías", es para cualquier negocio
 * que trabaje con citas. La barbería sigue apareciendo dentro de la demo —
 * hace falta un ejemplo concreto para que el flujo se entienda — pero el
 * mensaje de arriba tiene que servirle igual a un consultorio o a un spa.
 */

/** Fila de la agenda de ejemplo. `books` marca la columna que llena la demo. */
export type HeroAgendaRow = {
  time: string;
  /** Una celda por columna. Cadena vacía = hueco libre. */
  cells: readonly string[];
  books?: number;
};

export const hero = {
  badge: "Asistente de reservas por WhatsApp",

  /**
   * El título va partido porque la segunda mitad se pinta con el color de
   * marca. Partirlo acá evita meter etiquetas HTML en el copy.
   */
  title: {
    lead: "Tus clientes escriben.",
    accent: "Polaria agenda.",
  },
  subtitle:
    "Contesta cada mensaje al instante, ofrece los horarios libres de cada profesional y confirma la cita sola. Vos te enterás cuando ya está agendada.",

  /** El posicionamiento nuevo, dicho con ejemplos en vez de con adjetivos. */
  verticals: {
    label: "Para negocios que trabajan con citas",
    items: [
      "Barberías",
      "Salones de belleza",
      "Spas",
      "Salones de uñas",
      "Clínicas y consultorios",
      "Dentistas",
    ],
    more: "y más rubros",
  },

  /** Responde en el primer scroll las tres objeciones que frenan la decisión. */
  trust: [
    "No cambiás de número",
    "Listo en 15 minutos",
    "Podés intervenir cuando quieras",
  ],

  /** Rótulos del teléfono. Decir "ejemplo" es honestidad, no letra chica. */
  phone: {
    caption: "Así lo ve tu cliente",
    note: "Ejemplo del flujo de reserva. Se reproduce solo.",
    /** La animación resumida en una frase, para quien no puede verla. */
    a11y:
      "Conversación de ejemplo en WhatsApp: el cliente pide un turno, Polaria le ofrece los servicios con sus precios, los profesionales y los horarios libres, y confirma la cita.",
  },

  /**
   * La agenda que acompaña al teléfono.
   *
   * Es la otra mitad de la historia: mientras el cliente toca opciones en
   * WhatsApp, el hueco de las 16:30 de Fabián se llena solo. Los datos son de
   * ejemplo y viven acá para que adaptar el rubro no toque la UI.
   */
  agenda: {
    title: "Agenda de mañana",
    hint: "Lo que ves del otro lado",
    countLabel: "citas",
    footnote: "La cita entra sola, con el profesional y el horario que eligió.",
    columns: ["Fabián", "Marco", "Ernesto"],
    rows: [
      { time: "10:00", cells: ["", "Barba · Luis", ""] },
      { time: "11:30", cells: ["", "", "Cejas · Rita"] },
      { time: "13:00", cells: ["Corte · Ivo", "", "Corte · Aldo"] },
      { time: "14:00", cells: ["", "Decoloración · Sol", ""] },
      /** El hueco que reserva la conversación del teléfono. */
      { time: "16:30", cells: ["Corte · Pedro", "Corte · Beto", ""], books: 0 },
      { time: "18:00", cells: ["Corte · Nico", "", "Barba · Tito"] },
    ] satisfies readonly HeroAgendaRow[],
  },
} as const;
