/**
 * Lenguaje deliberado: "se conecta con", nunca "impulsado por" ni el logotipo
 * ajeno. Insinuar una afiliación con Meta o Google es de las cosas que hacen
 * fracasar una revisión de WhatsApp Business API.
 */
export const integrations = {
  eyebrow: "Integraciones",
  title: "Se conecta con lo que ya usás",
  description: "Nada nuevo que aprender. Polaria trabaja sobre tus herramientas.",

  live: [
    {
      name: "WhatsApp Business",
      body: "Polaria contesta a través de la API oficial de WhatsApp Business. Tus clientes escriben como siempre.",
    },
    {
      name: "Google Calendar",
      body: "Cada cita confirmada aparece en tu calendario, con el servicio y el nombre del cliente.",
    },
  ],

  soon: [
    "Recordatorios por SMS",
    "Cobro de seña por QR",
    "Varios profesionales en una misma agenda",
    "Reportes de ocupación semanal",
  ],

  disclaimer:
    "Polaria es un producto independiente. No está afiliado, patrocinado ni respaldado por Meta Platforms, Inc. ni por Google LLC. WhatsApp y Google Calendar son marcas de sus respectivos titulares.",
} as const;
