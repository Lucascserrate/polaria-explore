import { site } from '@/config/site';

/**
 * La raíz del sitio, mientras el marketplace no exista.
 *
 * Es un cartel, no una landing. Acá va a vivir el buscador de negocios; hasta
 * entonces la raíz no puede ser un 404, porque las páginas de reserva cuelgan
 * de ella y tarde o temprano alguien borra el slug de la barra de direcciones
 * para ver qué hay más arriba.
 *
 * No vende nada: quien llega es el cliente de un negocio, no un negocio
 * buscando software. Lo que hay para vender está en la landing, que es otro
 * dominio, y por eso el enlace se lee como una salida y no como un botón.
 *
 * TODO: reemplazar por el buscador del marketplace.
 */
export const home = {
	title: 'Polaria',
	body: 'Acá van a estar los negocios que toman turnos con Polaria.',
	landing: {
		label: `Conocer ${site.name}`,
		href: site.landingUrl,
	},
} as const;
