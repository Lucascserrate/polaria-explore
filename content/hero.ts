export const hero = {
  badge: "Acceso anticipado · primeros cupos",

  // Reconocimiento antes que promesa: el dueño tiene que verse a sí mismo en
  // la primera línea, no leer lo que le vamos a vender.
  title: "Contestá todos los mensajes sin soltar la tijera.",
  subtitle:
    "Polaria atiende tu WhatsApp y agenda las citas sola. Vos te enterás cuando ya están confirmadas.",

  /** Responde en el primer scroll las tres objeciones que frenan la decisión. */
  trust: [
    "No cambiás de número",
    "Listo en 15 minutos",
    "Podés intervenir cuando quieras",
  ],

  simulator: {
    eyebrow: "Probala",
    title: "Escribile como te escriben a vos",
    description:
      "Es una simulación, no un video. Escribí lo que quieras: hasta lo que ninguna respuesta automática sabría contestar.",
  },
} as const;
