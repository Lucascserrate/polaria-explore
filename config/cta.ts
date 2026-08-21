import { sectionIds } from '@/config/site';

/**
 * El CTA principal de Polaria es una capa de configuración, no un componente.
 *
 * Existe un problema de huevo y gallina: el CTA ideal ("escribile a Polaria por
 * WhatsApp") necesita un número de WhatsApp Business API, y ese número necesita
 * que Meta apruebe este mismo sitio. Así que la landing nace en modo
 * `simulador` y pasa a `whatsapp` cambiando UNA constante, sin tocar secciones.
 */
export type CtaMode = 'simulador' | 'whatsapp';

export const CTA_MODE: CtaMode = 'simulador';

/**
 * El número donde cualquiera puede hablar con el asistente.
 *
 * Es el mismo que figura en `config/site.ts`. Si el número de prueba pasa a ser
 * otro, cambiar SÓLO esta línea — el hero, el CTA y el mensaje precargado
 * salen todos de acá.
 *
 * Formato internacional, sin signos ni espacios.
 */
export const whatsapp = {
	number: '59176286578',
	greeting: 'Hola Polaria',
} as const;

export type CtaAction =
	| { kind: 'scroll'; targetId: string; label: string; hint?: string }
	| {
			kind: 'link';
			href: string;
			label: string;
			hint?: string;
			external?: boolean;
	  };

export function buildWhatsAppUrl() {
	return `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.greeting)}`;
}

/** CTA principal. Todo botón primario de la página consume esto. */
export function getPrimaryCta(): CtaAction {
	if (CTA_MODE === 'whatsapp' && whatsapp.number) {
		return {
			kind: 'link',
			href: buildWhatsAppUrl(),
			label: 'Escribile a Polaria',
			hint: 'Se abre WhatsApp',
			external: true,
		};
	}

	return {
		kind: 'scroll',
		targetId: sectionIds.simulador,
		label: 'Probar Polaria',
		hint: 'Simulación en vivo, sin registro',
	};
}

/** CTA secundario. Cambia de rol según el modo para no repetir el primario. */
export function getSecondaryCta(): CtaAction {
	if (CTA_MODE === 'whatsapp' && whatsapp.number) {
		return {
			kind: 'scroll',
			targetId: sectionIds.simulador,
			label: 'Ver cómo funciona',
		};
	}

	return {
		kind: 'scroll',
		targetId: sectionIds.accesoAnticipado,
		label: 'Quiero acceso anticipado',
	};
}

/**
 * Los dos CTA del hero.
 *
 * El hero es el único lugar que no espera al switch: mientras el resto de la
 * página sigue empujando al simulador, arriba ya se puede mandar un WhatsApp
 * real al asistente. Es el argumento más fuerte que tenemos y no hay razón
 * para reservarlo — pero sí para no propagarlo solo: cambiar `CTA_MODE` es una
 * decisión aparte, y así se toma a propósito.
 *
 * Si algún día no hay número, el hero cae sin ruido al CTA general.
 */
export function getHeroCtas(): { primary: CtaAction; secondary: CtaAction } {
	if (!whatsapp.number) {
		return { primary: getPrimaryCta(), secondary: getSecondaryCta() };
	}

	return {
		primary: {
			kind: 'link',
			href: buildWhatsAppUrl(),
			label: 'Probar por WhatsApp',
			hint: 'Se abre WhatsApp. Escribile como te escribiría un cliente.',
			external: true,
		},
		secondary: {
			kind: 'scroll',
			targetId: sectionIds.simulador,
			label: 'Ver la demo completa',
		},
	};
}

/**
 * Texto del formulario de captura dentro del simulador. En modo "whatsapp" el
 * formulario deja de tener sentido y el cierre invita a la conversación real.
 */
export function getSimulatorOutro() {
	if (CTA_MODE === 'whatsapp' && whatsapp.number) {
		return {
			title: 'Esto fue una simulación.',
			body: 'La Polaria de verdad está a un mensaje de distancia.',
			showForm: false as const,
		};
	}

	return {
		title: 'Esto fue una simulación.',
		body: 'Dejanos tu WhatsApp y te avisamos cuando puedas hablar con la Polaria real.',
		showForm: true as const,
	};
}
