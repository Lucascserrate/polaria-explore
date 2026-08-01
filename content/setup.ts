/**
 * Reemplaza al clásico "cómo funciona". El flujo en runtime ya lo mostró el
 * simulador; repetirlo en tres pasos es redundante. Lo que falta contestar es
 * cuánto trabajo le va a costar al dueño ponerlo a andar.
 */
export const setup = {
  eyebrow: "Puesta en marcha",
  title: "Andando en 15 minutos",
  description:
    "No es un proyecto. Es una tarde de martes entre cliente y cliente.",

  steps: [
    {
      number: "01",
      title: "Conectás tu WhatsApp",
      body: "Te acompañamos en la conexión. No instalás nada ni aprendés un sistema nuevo.",
      duration: "5 min",
    },
    {
      number: "02",
      title: "Cargás servicios y horarios",
      body: "Qué hacés, cuánto cobrás, cuánto dura y cuándo atendés. Eso es todo lo que Polaria necesita saber.",
      duration: "10 min",
    },
    {
      number: "03",
      title: "Polaria empieza a contestar",
      body: "Desde el primer mensaje. Vos seguís con lo tuyo y mirás la agenda cuando quieras.",
      duration: "ya",
    },
  ],
} as const;
