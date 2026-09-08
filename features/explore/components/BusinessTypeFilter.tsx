import Link from 'next/link';
import { explore } from '@/content/explore';
import { cn } from '@/lib/utils';
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
	if (options.length < 2) return null;

	return (
		<nav
			aria-label={explore.title}
			className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			<ul className="flex w-max gap-2 py-0.5">
				<li>
					<Chip href="/explore" active={!selected}>
						{explore.allTypes}
					</Chip>
				</li>

				{options.map((option) => (
					<li key={option.type}>
						<Chip
							href={`/explore?rubro=${option.type}`}
							active={selected === option.type}
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

function Chip({
	href,
	active,
	children,
}: {
	href: string;
	active: boolean;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			scroll={false}
			aria-current={active ? 'true' : undefined}
			className={cn(
				'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors',
				active
					? 'border-ink-950 bg-ink-950 text-paper-50'
					: 'border-paper-300 text-ink-700 hover:border-paper-400 hover:bg-paper-200',
			)}
		>
			{children}
		</Link>
	);
}

export default BusinessTypeFilter;
