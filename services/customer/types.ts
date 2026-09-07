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
