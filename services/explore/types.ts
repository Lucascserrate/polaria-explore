/**
 * El contrato de `/public/businesses` en la API de Polaria: el listado.
 *
 * Copia declarada a mano, por lo mismo que `services/booking/types.ts`: este
 * sitio y la API son dos despliegues distintos y compartir tipos ataría el
 * build de uno al código del otro. Lo que sí tiene que pasar es que cambiar el
 * contrato de un lado rompa el typecheck del otro, y para eso alcanza con que
 * este archivo sea el único lugar donde la forma está escrita de este lado.
 *
 * Es un contrato aparte del perfil y no un `Pick` de `PublicBusinessProfile`:
 * son dos respuestas distintas de la API. El perfil lo pide una página para un
 * negocio; esto lo pide una página para todos, y por eso no trae equipo,
 * servicios, horarios ni el estado de apertura.
 */

export type PublicBusinessSummary = {
	slug: string;
	name: string;
	/** El código del rubro (`BARBERSHOP`). Se traduce en `content/business-types.ts`. */
	businessType: string | null;
	address: string | null;
	/** `null` en los negocios que todavía no cargaron su ubicación: van sin marcador. */
	location: { latitude: number; longitude: number } | null;
	/** La primera foto de la galería, con sus medidas. */
	coverPhoto: { url: string; width: number; height: number } | null;
	/** Se usa **sólo** si no hay portada. Ver `BusinessCard`. */
	logoUrl: string | null;
};

export type PublicBusinessDirectory = {
	businesses: PublicBusinessSummary[];
};
