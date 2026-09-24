/**
 * El contrato de `/customer/*` en la API de Polaria: la cuenta de quien
 * reserva.
 *
 * Es la identidad de una **persona en Polaria**, no de un negocio ni de un
 * cliente de un negocio: la misma cuenta sirve para reservar en cualquier
 * negocio del marketplace. Declarado a mano, por lo mismo que el resto de
 * `services/`: cambiar el contrato de un lado tiene que romper el typecheck del
 * otro, y para eso alcanza con que la forma esté escrita en un solo lugar.
 */
export type CustomerSession = {
	name: string;
	email: string | null;
	/**
	 * `null` mientras la persona no lo dio, que es el estado de toda cuenta
	 * recién creada: Google no entrega el teléfono. **Sin esto no se puede
	 * reservar**, y es lo único que el flujo pide después de iniciar sesión.
	 */
	phone: string | null;
};

/**
 * En qué quedó un turno. Los mismos cuatro estados que guarda la API.
 *
 * Se escriben acá y no se derivan de la fecha porque no son lo mismo: un turno
 * de ayer que nadie marcó sigue `pending`, y uno cancelado puede ser de mañana.
 */
export type CustomerAppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'cancelled'
	| 'completed';

/**
 * Un turno de la cuenta: `GET /customer/me/appointments` y `…/past`.
 *
 * **Qué lista cae de qué lado lo define el backend y no esta página**: vigente
 * es el que ocupa agenda y todavía no empezó, y el historial es todo lo demás
 * —lo que ya pasó y lo cancelado, aunque el día no haya llegado—. Es la misma
 * regla con la que WhatsApp decide si recibe a alguien con "ya tenés un turno",
 * y por eso acá no hay ningún filtro por estado ni por fecha: una segunda
 * definición haría que el mismo turno contara en un canal y no en el otro, o
 * que quedara fuera de las dos listas.
 *
 * Es de la **cuenta**, no del teléfono. La diferencia importa: un número es un
 * identificador y no una credencial, así que listar por número dejaría ver
 * turnos ajenos a quien acierte uno.
 */
export type CustomerAppointment = {
	id: string;
	/** Instante de inicio en ISO. Se escribe con la zona del negocio. */
	startTime: string;
	endTime: string;
	status: CustomerAppointmentStatus;
	serviceName: string;
	/** `null` cuando el turno quedó sin profesional a la vista. */
	staffName: string | null;
	/**
	 * El negocio del turno.
	 *
	 * Viaja aunque se haya pedido filtrando por un negocio —donde la página ya lo
	 * sabe— porque es lo que deja que el mismo contrato sirva para una lista que
	 * mezcle negocios, que es lo que es el historial.
	 */
	business: {
		slug: string;
		name: string;
		timezone: string;
		/** La portada del local, o `null` si no subió fotos. */
		photoUrl: string | null;
	};
};

/** Un servicio del turno, con lo que se pactó al reservarlo. */
export type CustomerAppointmentItem = {
	name: string;
	staffName: string | null;
	/** Cuándo empieza **este** servicio, que con varios no es el del turno. */
	startTime: string;
	durationMinutes: number;
	/** `null` cuando el servicio se cotiza: el precio sale en el local. */
	price: number | null;
};

/**
 * El turno abierto: `GET /customer/me/appointments/:id`.
 *
 * Extiende la vista de la lista porque la pantalla de detalle muestra lo mismo
 * y además el desglose; lo que agrega es lo que sólo se mira con el turno
 * abierto —cuánto sale, dónde es— y no tendría sentido traer para cada tarjeta
 * de una lista.
 */
export type CustomerAppointmentDetail = CustomerAppointment & {
	/** En orden de atención. Nunca vacío. */
	services: CustomerAppointmentItem[];
	/**
	 * Lo que dura estar ahí, del inicio del bloque a su fin.
	 *
	 * Con servicios en paralelo es menos que la suma de los servicios, y es esto
	 * —no la suma— lo que ocupa la tarde de alguien.
	 */
	durationMinutes: number;
	/**
	 * La suma de lo pactado, o `null` si algún servicio se cotiza.
	 *
	 * `null` y no la suma de los que sí tienen importe: un total que ignora al
	 * servicio que se cotiza es un número que el cliente lee como lo que paga, y
	 * no lo es. Misma regla que el resumen de la reserva.
	 */
	total: number | null;
	currency: string;
	address: string | null;
	location: { latitude: number; longitude: number } | null;
	note: string | null;
};
