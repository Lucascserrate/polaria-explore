import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

/**
 * Por ahora, sólo la raíz.
 *
 * Las páginas de reserva no se listan a mano: cuando exista el buscador del
 * marketplace, éste es el lugar donde hay que pedirle a la API la lista de
 * negocios publicados y mapearla. Hasta entonces cada negocio reparte su URL.
 *
 * /privacy y /terms se fueron con la landing, a su propio dominio y su propio
 * sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	return [{ url: site.url, changeFrequency: 'daily', priority: 1 }];
}
