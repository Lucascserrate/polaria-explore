/**
 * El miedo número uno del dueño no es que Polaria no funcione: es que le diga
 * una burrada a un cliente y lo pierda. Esta sección existe sólo para eso.
 */
export const control = {
  eyebrow: "Control",
  title: "Vos seguís teniendo la última palabra",
  description:
    "Polaria no improvisa. Cuando algo se sale de lo que sabe, te lo pasa a vos en lugar de inventar.",

  items: [
    {
      icon: "shield" as const,
      title: "No inventa precios ni horarios",
      body: "Sólo dice lo que vos cargaste. Si no lo tiene, no lo completa por su cuenta.",
    },
    {
      icon: "handoff" as const,
      title: "Te deriva lo que no sabe",
      body: "La consulta rara te llega marcada, y el cliente queda avisado de que le vas a responder vos.",
    },
    {
      icon: "chat" as const,
      title: "Podés entrar en cualquier momento",
      body: "Si escribís vos en la conversación, Polaria se corre y te deja seguir a vos.",
    },
    {
      icon: "sliders" as const,
      title: "La apagás cuando quieras",
      body: "Un botón. Sin llamadas para dar de baja y sin permanencia.",
    },
  ],
} as const;
