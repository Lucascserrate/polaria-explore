/** Ordenadas por miedo, no por tema. Lo que frena la decisión va primero. */
export const faq = {
  eyebrow: "Preguntas frecuentes",
  title: "Lo que todos preguntan antes de decidirse",

  items: [
    {
      question: "¿Tengo que cambiar mi número de WhatsApp?",
      // Respuesta honesta a propósito: al conectar un número a la API oficial,
      // ese número deja de funcionar en la app común. Ocultarlo genera un
      // problema el primer día. Decirlo genera confianza.
      answer:
        "Podés usar tu número actual, pero hay algo que conviene saber antes: cuando un número se conecta a la API oficial de WhatsApp Business, deja de funcionar en la aplicación común del teléfono. Por eso muchos negocios prefieren conectar un número nuevo y publicarlo como el de reservas. Lo vemos juntos según cómo trabajes y decidís vos.",
    },
    {
      question: "¿Y si Polaria le contesta cualquier cosa a un cliente?",
      answer:
        "Polaria sólo responde con la información que vos cargaste: tus servicios, tus precios y tus horarios. No completa lo que no sabe. Cuando una consulta se sale de eso, le avisa al cliente que le vas a responder vos y te la deja marcada como pendiente. Además podés meterte en cualquier conversación y seguir vos.",
    },
    {
      question: "¿Cuánto tardo en tenerla funcionando?",
      answer:
        "Alrededor de quince minutos, y no los pasás solo: en esta etapa hacemos la configuración inicial con vos. No hay nada que instalar en el teléfono ni en la computadora.",
    },
    {
      question: "¿Cuánto cuesta?",
      answer:
        "Todavía no fijamos los planes. Preferimos definir el precio con los primeros negocios que la usen en serio antes que poner un número que después haya que corregir. Si entrás ahora, lo acordamos con vos antes de cobrarte nada.",
    },
    {
      question: "¿Necesito saber de tecnología?",
      answer:
        "No. Si sabés usar WhatsApp, alcanza. Todo lo que Polaria necesita saber son datos que ya tenés en la cabeza: qué hacés, cuánto cobrás y cuándo atendés.",
    },
    {
      question: "¿Sirve para mi negocio si no es una barbería?",
      answer:
        "Hoy está afinada para peluquerías y barberías, que es donde la estamos probando. La lógica sirve para cualquier negocio que trabaje con citas, y lo vamos a ir abriendo. Si tenés otro rubro, escribinos igual y te decimos con franqueza si te sirve todavía.",
    },
    {
      question: "¿Qué pasa con los datos de mis clientes?",
      answer:
        "Los mensajes se usan para atender la conversación y agendar la cita, nada más. No vendemos ni cedemos datos a terceros. El detalle completo está en la política de privacidad.",
    },
  ],
} as const;
