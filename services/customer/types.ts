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
 * Un turno vigente de la cuenta: `GET /customer/me/appointments`.
 *
 * **Vigente lo define el backend y no esta página**: ocupa agenda —pendiente o
 * confirmado— y todavía no empezó. Es la misma regla con la que WhatsApp decide
 * si recibe a alguien con "ya tenés un turno", y por eso acá no hay ningún
 * filtro por estado ni por fecha: una segunda definición haría que el mismo
 * turno contara en un canal y no en el otro.
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
	serviceName: string;
	/** `null` cuando el turno quedó sin profesional a la vista. */
	staffName: string | null;
	/**
	 * El negocio del turno.
	 *
	 * Viaja aunque se haya pedido filtrando por un negocio —donde la página ya lo
	 * sabe— porque es lo que deja que el mismo contrato sirva para una lista que
	 * mezcle negocios, que es lo que va a ser "Mis turnos".
	 */
	business: {
		slug: string;
		name: string;
		timezone: string;
	};
};
