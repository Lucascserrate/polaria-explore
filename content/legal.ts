import { site } from '@/config/site';

/**
 * Textos legales.
 *
 * IMPORTANTE: son un borrador de trabajo, no asesoramiento legal. Antes de
 * enviar la solicitud a Meta conviene que los revise un abogado y que se
 * completen la razón social, el domicilio fiscal y el responsable de datos.
 */

export const lastUpdated = '1 de agosto de 2026';

export type LegalSection = {
	title: string;
	paragraphs: string[];
	bullets?: string[];
};

export const privacy: {
	title: string;
	intro: string;
	sections: LegalSection[];
} = {
	title: 'Política de privacidad',
	intro: `Esta política explica qué datos trata ${site.name} cuando un negocio usa el servicio y cuando una persona conversa con el asistente por WhatsApp.`,
	sections: [
		{
			title: 'Quién es responsable de los datos',
			paragraphs: [
				`${site.legal.entity}, con domicilio en ${site.legal.city}, ${site.legal.country}, es responsable del tratamiento de los datos descritos en esta política. Podés contactarnos en ${site.phoneNumber} para cualquier consulta relacionada.`,
				'El negocio que contrata el servicio (por ejemplo, una peluquería) es responsable de los datos de sus propios clientes. Nosotros los tratamos por su cuenta y siguiendo sus instrucciones.',
			],
		},
		{
			title: 'Qué datos tratamos',
			paragraphs: [
				'Tratamos únicamente lo necesario para atender la conversación y gestionar la cita:',
			],
			bullets: [
				'Número de teléfono y nombre de perfil de quien escribe por WhatsApp.',
				'El contenido de los mensajes intercambiados con el asistente.',
				'Los datos de la cita: servicio solicitado, fecha, hora y estado.',
				'Los datos del negocio: nombre comercial, servicios, precios y horarios de atención.',
				'Datos técnicos mínimos de funcionamiento, como registros de errores y marcas de tiempo.',
			],
		},
		{
			title: 'Para qué los usamos',
			paragraphs: [
				'Usamos los datos para responder mensajes, agendar y modificar citas, enviar recordatorios y avisar al negocio cuando una consulta requiere intervención humana.',
				'También los usamos de forma agregada para mejorar la calidad de las respuestas. En esa tarea no identificamos a personas concretas.',
			],
		},
		{
			title: 'Con quién los compartimos',
			paragraphs: [
				'No vendemos datos personales ni los cedemos con fines publicitarios.',
				'Compartimos lo imprescindible con los proveedores que hacen funcionar el servicio: la plataforma de mensajería a través de la cual llega la conversación, el proveedor de calendario que el negocio haya conectado y nuestros servicios de alojamiento. Cada uno trata los datos sólo para prestar su función.',
			],
		},
		{
			title: 'Cuánto tiempo los conservamos',
			paragraphs: [
				'Conservamos las conversaciones y las citas mientras el negocio mantenga el servicio activo y durante el plazo que exija la normativa aplicable.',
				'Si un negocio deja de usar Polaria, eliminamos o anonimizamos sus datos dentro de los noventa días siguientes, salvo que debamos conservarlos por una obligación legal.',
			],
		},
		{
			title: 'Tus derechos',
			paragraphs: [
				`Podés pedirnos acceso a tus datos, su corrección, su eliminación o la limitación de su tratamiento escribiendo a ${site.phoneNumber}. Respondemos dentro de los treinta días.`,
				'Si escribiste a un negocio que usa Polaria y querés ejercer tus derechos sobre esa conversación, podés dirigirte al negocio directamente o a nosotros, y lo coordinamos con él.',
			],
		},
		{
			title: 'Seguridad',
			paragraphs: [
				'Ciframos los datos en tránsito y en reposo, restringimos el acceso interno a lo estrictamente necesario y registramos los accesos. Ningún sistema es infalible, pero trabajamos para que un incidente sea poco probable y detectable.',
			],
		},
		{
			title: 'Menores de edad',
			paragraphs: [
				'El servicio está dirigido a negocios y a personas adultas. No solicitamos ni tratamos deliberadamente datos de menores. Si un negocio agenda una cita para un menor, los datos de contacto que tratamos son los de la persona adulta que escribe.',
			],
		},
		{
			title: 'Cambios en esta política',
			paragraphs: [
				`Si cambiamos esta política, actualizamos la fecha del encabezado y, cuando el cambio sea relevante, avisamos a los negocios activos por correo. La versión vigente es siempre la publicada en ${site.url}/privacy.`,
			],
		},
	],
};

export const terms: { title: string; intro: string; sections: LegalSection[] } =
	{
		title: 'Términos del servicio',
		intro: `Estos términos regulan el uso de ${site.name}. Al usar el servicio, el negocio acepta lo que sigue.`,
		sections: [
			{
				title: 'Qué es el servicio',
				paragraphs: [
					`${site.name} es un asistente que responde mensajes de WhatsApp y gestiona citas en nombre de un negocio, con la información que ese negocio configura: sus servicios, sus precios y sus horarios.`,
					'El servicio se encuentra en una etapa inicial y se presta a un número limitado de negocios mientras se afina con casos reales.',
				],
			},
			{
				title: 'Responsabilidad del negocio',
				paragraphs: ['Quien contrata el servicio se compromete a:'],
				bullets: [
					'Cargar información veraz sobre sus servicios, precios y horarios de atención.',
					'Contar con el derecho a usar el número de teléfono que conecte al servicio.',
					'Informar a sus clientes de que un asistente automatizado atiende sus mensajes.',
					'Revisar las consultas que el asistente le derive y responderlas en un plazo razonable.',
					'No usar el servicio para enviar comunicaciones no solicitadas ni contenido ilícito.',
				],
			},
			{
				title: 'Límites del asistente',
				paragraphs: [
					'El asistente responde a partir de la información configurada por el negocio y deriva a una persona lo que queda fuera de ese alcance. Aun así, puede cometer errores.',
					'El negocio es responsable de la relación con sus clientes y de las citas que se agenden. Recomendamos revisar la agenda con regularidad, especialmente durante los primeros días de uso.',
				],
			},
			{
				title: 'Disponibilidad',
				paragraphs: [
					'Trabajamos para que el servicio esté disponible de forma continua, pero no garantizamos una disponibilidad ininterrumpida. Puede haber interrupciones por mantenimiento, por incidencias propias o por fallos de las plataformas de terceros de las que depende el servicio.',
					'Avisaremos con antelación de los mantenimientos programados siempre que sea posible.',
				],
			},
			{
				title: 'Precio y facturación',
				paragraphs: [
					'Durante la etapa de acceso anticipado, las condiciones económicas se acuerdan individualmente con cada negocio y se comunican por escrito antes de cualquier cobro.',
					'Cuando se publiquen planes generales, los negocios activos serán informados con antelación suficiente y podrán decidir si continúan.',
				],
			},
			{
				title: 'Baja del servicio',
				paragraphs: [
					'El negocio puede dejar de usar el servicio en cualquier momento, sin permanencia ni penalización. Al darse de baja, el asistente deja de responder y los datos se tratan según lo indicado en la política de privacidad.',
					'Podemos suspender el servicio a un negocio que incumpla estos términos, avisando previamente salvo que el incumplimiento sea grave.',
				],
			},
			{
				title: 'Limitación de responsabilidad',
				paragraphs: [
					'En la medida en que lo permita la normativa aplicable, nuestra responsabilidad se limita al importe abonado por el negocio en los tres meses anteriores al hecho que la origine.',
					'No respondemos por lucro cesante ni por daños indirectos derivados del uso o de la imposibilidad de uso del servicio.',
				],
			},
			{
				title: 'Relación con terceros',
				paragraphs: [
					'Polaria es un producto independiente. No está afiliado, patrocinado ni respaldado por Meta Platforms, Inc. ni por Google LLC. El uso de sus plataformas está sujeto además a las condiciones de cada una.',
				],
			},
			{
				title: 'Cambios y contacto',
				paragraphs: [
					`Podemos actualizar estos términos. Los cambios relevantes se comunican a los negocios activos por correo. Para cualquier consulta, escribinos a ${site.phoneNumber}.`,
				],
			},
		],
	};

/**
 * Rótulos del encabezado y el pie de /privacy y /terms.
 *
 * Con la landing dada de baja, estas dos páginas son todo el sitio de Polaria
 * que Meta puede visitar. El pie es el único lugar donde quedan el titular, el
 * contacto y el descargo de marcas: no es decoración, es parte de lo que se
 * revisa.
 */
export const legalChrome = {
	nav: [
		{ label: 'Política de privacidad', href: '/privacy' },
		{ label: 'Términos del servicio', href: '/terms' },
	],
	contact: `${site.contactEmail} · ${site.phoneNumber}`,
	issuer: `${site.legal.entity} · ${site.legal.city}, ${site.legal.country}`,
	disclaimer:
		'Polaria es un producto independiente. No está afiliado, patrocinado ni respaldado por Meta Platforms, Inc. ni por Google LLC. WhatsApp y Google Calendar son marcas de sus respectivos titulares.',
} as const;
