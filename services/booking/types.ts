/**
 * El contrato de `/public/businesses/:slug` en la API de Polaria.
 *
 * Es una copia declarada a mano y no un tipo importado: la landing y la API son
 * dos despliegues distintos, y compartir tipos entre ellos ataría el build de
 * uno al código del otro. Lo que sí tiene que pasar es que cambiar el contrato
 * de un lado rompa el typecheck del otro, y para eso alcanza con que este
 * archivo sea el único lugar donde la forma está escrita.
 */

import type { BookingSelection } from './selection';

export type BusinessStatus =
	| { open: true; closesAt: string }
	| {
			open: false;
			opensAt: {
				/** 0 = domingo. */
				dayOfWeek: number;
				/** `HH:MM` en la zona del negocio. */
				time: string;
				/** 0 = hoy más tarde, 1 = mañana. Decide cómo se nombra el día. */
				daysAhead: number;
			} | null;
	  };

export type WeeklyRange = {
	/** 0 = domingo. */
	dayOfWeek: number;
	startTime: string;
	endTime: string;
};

export type PublicService = {
	id: string;
	name: string;
	/** La categoría a la que pertenece, o `null` si a ninguna. */
	categoryId: string | null;
	description: string | null;
	/**
	 * Cuánto cuesta, o `null` si el negocio lo cotiza después de ver a la persona.
	 *
	 * `null` no es `0`: uno es "todavía no se sabe" y el otro es "no se cobra".
	 * Donde iría el importe va `booking.services.quotedPrice`.
	 */
	price: number | null;
	/**
	 * La moneda de `price`, en ISO 4217.
	 *
	 * Es del servicio y no del negocio: un catálogo puede cobrar una consulta
	 * presencial en bolivianos y una sesión online en dólares. El `currency` del
	 * perfil quedó como la moneda por defecto, para escribir un cero.
	 */
	currency: string;
	durationMinutes: number;
};

export type PublicStaff = {
	id: string;
	name: string;
	jobTitle: string | null;
	photoUrl: string | null;
};

export type PublicPhoto = {
	id: string;
	url: string;
	width: number;
	height: number;
};

/**
 * Un horario ofrecible. No trae los profesionales habilitados a propósito:
 * cuando el cliente elige "cualquier profesional", quién atiende lo decide el
 * servidor al confirmar.
 */
export type PublicSlot = {
	startTime: string;
	endTime: string;
};

export type PublicBusinessProfile = {
	slug: string;
	name: string;
	businessType: string | null;
	photos: PublicPhoto[];
	/**
	 * Trabajos terminados, aparte de las fotos del local.
	 *
	 * Dos colecciones y no una porque contestan cosas distintas: la galería de
	 * arriba muestra cómo es el lugar, y esto cómo cortan. Vacío es lo normal y
	 * significa que el negocio no subió trabajos: la sección no se dibuja.
	 */
	portfolio: PublicPhoto[];
	team: PublicStaff[];
	timezone: string;
	/** ISO 4217. Los precios se formatean con esto, no con una moneda fija. */
	currency: string;
	/** Prefijo telefónico sugerido en el formulario, sin `+`. */
	dialCode: string;
	address: string | null;
	location: { latitude: number; longitude: number } | null;
	status: BusinessStatus;
	businessHours: WeeklyRange[];
	services: PublicService[];
	/**
	 * Las categorías con las que se agrupa el catálogo, ya ordenadas por el
	 * negocio. Sólo llegan las que tienen algún servicio.
	 *
	 * Vacío es el caso normal —el negocio no categorizó— y entonces la lista se
	 * muestra entera, sin filtros.
	 *
	 * **Opcional a propósito.** Este sitio y la API se despliegan por separado, y
	 * si el sitio sale primero el campo no viene: leerlo sin más rompía la página
	 * del negocio entera con un 500, para todos. Un catálogo sin filtros es peor
	 * que uno con filtros, y muchísimo mejor que ninguna página.
	 */
	categories?: PublicServiceCategory[];
};

export type PublicServiceCategory = {
	id: string;
	name: string;
	description: string | null;
};

/**
 * Quién puede atender lo elegido.
 *
 * Dos listas porque la pantalla hace dos preguntas seguidas: `shared` es quién
 * puede con **toda** la reserva —lo que se ofrece por defecto— y `byService`
 * quién puede con **cada** servicio, que es lo que hace falta para repartirla.
 *
 * Con un solo servicio las dos dicen lo mismo y la pantalla usa `shared`.
 *
 * **`shared` vacía con `byService` llena no es un error**: significa que nadie
 * hace todos los servicios elegidos y que la reserva sólo existe repartida entre
 * dos personas. La pantalla tiene que decirlo con esas palabras, no mostrar una
 * lista vacía.
 */
export type PublicBookingStaff = {
	shared: PublicStaff[];
	/** En el mismo orden en que se pidieron los servicios. */
	byService: { serviceId: string; staff: PublicStaff[] }[];
};

/** Un servicio dentro del comprobante, con su tramo ya resuelto. */
export type PublicBookedService = {
	serviceId: string;
	name: string;
	staffName: string | null;
	price: number | null;
	durationMinutes: number;
	startTime: string;
};

/**
 * El comprobante de la reserva.
 *
 * Los horarios de arriba son los del **bloque**: de cuando empieza el primer
 * servicio a cuando termina el último. Lo de cada uno va en `services`.
 */
export type PublicBookingConfirmation = {
	id: string;
	startTime: string;
	endTime: string;
	currency: string;
	/** La suma de los servicios: lo que dura estar ahí. */
	durationMinutes: number;
	services: PublicBookedService[];
	note: string | null;
};

/** Lo que la página manda para crear la reserva. */
export type CreateBookingInput = BookingSelection & {
	startTime: string;
	/**
	 * Quién reserva. **Se omiten cuando hay sesión de cliente**: en ese caso los
	 * toma la API de la cuenta, y mandarlos vacíos haría fallar su validación de
	 * longitud —`@IsOptional` deja pasar lo ausente, no lo vacío—.
	 */
	customerName?: string;
	customerPhone?: string;
};
