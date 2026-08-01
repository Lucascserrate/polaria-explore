/**
 * Catálogo de intenciones.
 *
 * `phrases` son expresiones de varias palabras: valen más porque son señal
 * fuerte. `tokens` son palabras sueltas: valen menos y sólo cuentan como
 * palabra completa, para que "corte" no dispare dentro de "cortesía".
 *
 * Ampliar la demo = agregar entradas acá. No hay que tocar ni la UI ni el reducer.
 */

export type IntentId =
  | "saludo"
  | "disponibilidad"
  | "precio"
  | "servicios"
  | "horario"
  | "ubicacion"
  | "cambiar_cita"
  | "cancelar"
  | "confirmar"
  | "agradecer"
  | "domicilio"
  | "ninos"
  | "pago"
  | "humano";

export type IntentDefinition = {
  id: IntentId;
  phrases: string[];
  tokens: string[];
};

export const intents: IntentDefinition[] = [
  {
    id: "saludo",
    phrases: ["buenas tardes", "buenos dias", "buenas noches", "que tal", "como estas"],
    tokens: ["hola", "buenas", "hey", "holi", "alo"],
  },
  {
    id: "disponibilidad",
    phrases: [
      "tienen cita",
      "hay cita",
      "tienen turno",
      "hay turno",
      "tienen lugar",
      "hay lugar",
      "tienen espacio",
      "hay espacio",
      "para manana",
      "para hoy",
      "puedo ir",
      "se puede pasar",
      "quiero una cita",
      "quiero reservar",
      "quiero agendar",
      "quiero sacar",
      "necesito una cita",
      "sacar cita",
      "agendar una cita",
      "reservar una cita",
      "hay disponibilidad",
      "estan disponibles",
    ],
    tokens: ["cita", "turno", "reservar", "agendar", "disponibilidad", "manana", "cupo"],
  },
  {
    id: "precio",
    phrases: [
      "cuanto cuesta",
      "cuanto sale",
      "cuanto esta",
      "cuanto vale",
      "que precio",
      "lista de precios",
      "cuanto cobran",
      "cuanto es",
    ],
    tokens: ["precio", "precios", "cuesta", "vale", "tarifa", "tarifas", "cobran"],
  },
  {
    id: "servicios",
    phrases: [
      "que servicios",
      "que hacen",
      "que ofrecen",
      "hacen barba",
      "hacen color",
      "hacen tinte",
      "que incluye",
    ],
    tokens: ["servicios", "servicio", "barba", "color", "tinte", "mechas"],
  },
  {
    id: "horario",
    phrases: [
      "a que hora",
      "que horario",
      "hasta que hora",
      "abren los domingos",
      "estan abiertos",
      "trabajan los domingos",
      "hasta cuando atienden",
    ],
    tokens: ["horario", "horarios", "abren", "cierran", "abierto", "domingo", "domingos"],
  },
  {
    id: "ubicacion",
    phrases: ["donde estan", "donde queda", "cual es la direccion", "como llego"],
    tokens: ["direccion", "ubicacion", "donde", "mapa"],
  },
  {
    id: "cambiar_cita",
    phrases: [
      "cambiar mi cita",
      "cambiar la cita",
      "mover mi cita",
      "mover la cita",
      "reprogramar",
      "cambiar el horario",
      "puedo cambiar",
      "correr la cita",
      "pasar la cita",
      "otro horario",
    ],
    tokens: ["cambiar", "mover", "reprogramar", "reagendar"],
  },
  {
    id: "cancelar",
    phrases: ["cancelar mi cita", "cancelar la cita", "no voy a poder ir", "dar de baja"],
    tokens: ["cancelar", "anular"],
  },
  {
    id: "confirmar",
    phrases: [
      "esta bien",
      "me sirve",
      "de una",
      "perfecto",
      "dale nomas",
      "asi esta bien",
      "me queda bien",
    ],
    tokens: ["si", "dale", "listo", "ok", "oka", "bueno", "confirmo", "va"],
  },
  {
    id: "agradecer",
    phrases: ["muchas gracias", "mil gracias", "te pasaste"],
    tokens: ["gracias", "grax"],
  },
  {
    id: "domicilio",
    phrases: ["a domicilio", "van a casa", "vienen a mi casa", "servicio a domicilio"],
    tokens: ["domicilio"],
  },
  {
    id: "ninos",
    phrases: [
      "corte de nino",
      "corte para nino",
      "atienden ninos",
      "cortan a ninos",
      "mi hijo",
      "mi hija",
      "para mi nene",
      "corte infantil",
    ],
    tokens: ["nino", "nina", "nene", "nena", "infantil", "hijo", "hija"],
  },
  {
    id: "pago",
    phrases: [
      "aceptan tarjeta",
      "puedo pagar con",
      "aceptan qr",
      "aceptan transferencia",
      "se puede pagar",
      "forma de pago",
      "metodos de pago",
    ],
    tokens: ["tarjeta", "efectivo", "transferencia", "qr", "pago", "pagar"],
  },
  {
    id: "humano",
    phrases: [
      "hablar con una persona",
      "hablar con alguien",
      "hablar con el dueno",
      "quiero un humano",
      "pasame con",
      "atencion humana",
    ],
    tokens: ["humano", "persona", "encargado", "dueno"],
  },
];
