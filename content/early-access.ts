/**
 * Estamos en pre-lanzamiento y no hay clientes que mostrar. La salida no es
 * inventar testimonios —en un gremio chico donde todos se conocen eso se paga
 * caro, y además complica la revisión de Meta— sino encuadrarlo como elección
 * deliberada en vez de como producto a medio hacer.
 */
export const earlyAccess = {
  eyebrow: "Acceso anticipado",
  title: "Estamos abriendo los primeros cupos",
  description:
    "Polaria todavía no está abierta a todo el mundo. Estamos arrancando con un grupo chico de barberías y peluquerías para afinarla con mensajes reales antes de escalar.",

  perks: [
    {
      title: "Configuración hecha con vos",
      body: "Cargamos tus servicios, precios y horarios junto a vos. No te dejamos un panel vacío.",
    },
    {
      title: "Línea directa con quien la construye",
      body: "Nos escribís y te contesta alguien del equipo, no un formulario.",
    },
    {
      title: "Condiciones preferenciales",
      body: "Cuando definamos los planes, los negocios de esta etapa los van a acordar con nosotros antes de que se cobre nada.",
    },
  ],

  formTitle: "Dejanos tu WhatsApp",
  formBody: "Te escribimos para coordinar una prueba con tu negocio.",
} as const;
