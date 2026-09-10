'use client';

import { useSearchParams } from 'next/navigation';
import { Chip } from '@/components/ui/chip';
import { explore } from '@/content/explore';
import { BusinessTypeIcon } from '../business-type-icon';

/** Un rubro que de verdad tiene negocios en la lista. */
export type BusinessTypeOption = { type: string; label: string };

/**
 * Los rubros, arriba de la lista.
 *
 * **Sólo se ofrecen los que existen.** Las opciones las arma la página con los
 * rubros que traen los negocios cargados, no con el catálogo completo: un chip
 * de "Clínica dental" que devuelve cero es una promesa incumplida, y encima
 * hace ver vacío un buscador que no lo está. Por lo mismo, con menos de dos
 * rubros distintos la fila entera desaparece —"Todos" y un único chip son la
 * misma lista dos veces—.
 *
 * Filtra por la URL (`/explore?rubro=BARBERSHOP`) y no con estado del
 * navegador: son enlaces, así que andan sin JavaScript, se pueden compartir y
 * el botón de atrás hace lo que tiene que hacer. `scroll={false}` porque el
 * filtro está arriba de todo y la página ya está donde tiene que estar.
 *
 * La píldora es `components/ui/chip.tsx`, compartida con la fila de rubros de
 * la raíz: son el mismo control antes y después de elegir, y tienen que verse
 * igual.
 *
 * **Cada enlace conserva el resto de la consulta**, que hoy es dónde está
 * mirando el mapa. Por eso lee la URL en el navegador en lugar de recibirla
 * dibujada: el encuadre lo reescribe el mapa con `replaceState` cada vez que se
 * mueve, así que un `href` armado en el servidor quedaría viejo apenas alguien
 * arrastra, y elegir un rubro devolvería el mapa a donde estaba al abrir.
 *
 * El código del rubro viaja crudo en la URL a propósito: es el mismo valor que
 * guarda la API, así que no hay una tercera tabla de nombres bonitos que
 * mantener sincronizada.
 */
export function BusinessTypeFilter({
	options,
	selected,
}: {
	options: BusinessTypeOption[];
	selected: string | null;
}) {
	const search = useSearchParams();

	const hrefFor = (type: string | null) => {
		const params = new URLSearchParams(search.toString());

		if (type) params.set('rubro', type);
		else params.delete('rubro');

		const query = params.toString();

		return query ? `/explore?${query}` : '/explore';
	};

	if (options.length < 2) return null;

	return (
		<nav
			aria-label={explore.title}
			className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			<ul className="flex w-max gap-2 py-0.5">
				<li>
					<Chip href={hrefFor(null)} active={!selected} scroll={false}>
						{explore.allTypes}
					</Chip>
				</li>

				{options.map((option) => (
					<li key={option.type}>
						<Chip
							href={hrefFor(option.type)}
							active={selected === option.type}
							scroll={false}
						>
							<BusinessTypeIcon type={option.type} className="size-4" />
							{option.label}
						</Chip>
					</li>
				))}
			</ul>
		</nav>
	);
}

export default BusinessTypeFilter;
