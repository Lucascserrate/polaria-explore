import { businessTypeLabel } from '@/content/business-types';
import type { PublicBusinessSummary } from '@/services/explore/types';
import type { BusinessTypeOption } from './components/BusinessTypeFilter';

/**
 * Los rubros que se pueden ofrecer como filtro: los que tienen negocios.
 *
 * Se arma con lo que hay y no con el catálogo completo. Un chip que devuelve
 * cero resultados es una promesa incumplida —y, peor, hace parecer vacío a un
 * buscador que no lo está—, así que si todavía no hay ninguna clínica dental,
 * "Clínica dental" no existe en esta pantalla.
 *
 * Queda afuera el rubro que no sabemos nombrar: un código que la API tiene y
 * `content/business-types.ts` todavía no —porque el catálogo creció de un lado
 * antes que del otro— no puede ser un chip que diga `PET_BOARDING`. Esos
 * negocios siguen apareciendo en la lista completa; lo único que no tienen es
 * atajo propio.
 *
 * Ordenados por cantidad: el rubro con más negocios es el que más gente busca,
 * y en una fila que se desplaza a lo ancho eso decide qué se ve sin arrastrar.
 * A igual cantidad, alfabético, para que el orden no baile entre dos cargas.
 */
export function typeOptions(
	businesses: PublicBusinessSummary[],
): BusinessTypeOption[] {
	const counts = new Map<string, number>();

	for (const business of businesses) {
		const { businessType } = business;
		if (!businessType || !businessTypeLabel(businessType)) continue;

		counts.set(businessType, (counts.get(businessType) ?? 0) + 1);
	}

	return [...counts.entries()]
		.map(([type, count]) => ({
			type,
			label: businessTypeLabel(type) as string,
			count,
		}))
		.sort(
			(a, b) =>
				b.count - a.count ||
				a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }),
		)
		.map(({ type, label }) => ({ type, label }));
}
