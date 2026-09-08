import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

/**
 * Por ahora, la raíz y el buscador.
 *
 * Las páginas de reserva todavía no se listan. Ahora que la API sabe
 * enumerarlas —`listBusinesses`, el mismo servicio que alimenta `/explore`—
 * éste es el lugar donde hay que mapearlas, y es una decisión aparte: listar a
 * un negocio acá es pedirle a Google que lo indexe. Hasta entonces cada negocio
 * reparte su URL.
 *
 * /privacy y /terms se fueron con la landing, a su propio dominio y su propio
 * sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: site.url, changeFrequency: 'daily', priority: 1 },
		{ url: `${site.url}/explore`, changeFrequency: 'daily', priority: 0.9 },
	];
}
