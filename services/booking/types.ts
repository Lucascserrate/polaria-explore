/**
 * El contrato de `/public/businesses/:slug` en la API de Polaria.
 *
 * Es una copia declarada a mano y no un tipo importado: la landing y la API son
 * dos despliegues distintos, y compartir tipos entre ellos ataría el build de
 * uno al código del otro. Lo que sí tiene que pasar es que cambiar el contrato
 * de un lado rompa el typecheck del otro, y para eso alcanza con que este
 * archivo sea el único lugar donde la forma está escrita.
 */

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
	description: string | null;
	price: number;
	durationMinutes: number;
};

export type PublicStaff = {
	id: string;
	name: string;
	jobTitle: string | null;
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
};

export type PublicBookingConfirmation = {
	id: string;
	startTime: string;
	endTime: string;
	serviceName: string;
	staffName: string | null;
	price: number;
	durationMinutes: number;
};

/** Lo que la página manda para crear la reserva. */
export type CreateBookingInput = {
	serviceId: string;
	/** Ausente es "cualquier profesional". */
	staffId?: string;
	startTime: string;
	customerName: string;
	customerPhone: string;
};
