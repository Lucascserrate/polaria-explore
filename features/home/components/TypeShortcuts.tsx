import { Chip } from '@/components/ui/chip';
import { home } from '@/content/home';
import { BusinessTypeIcon } from '@/features/explore/business-type-icon';
import type { BusinessTypeOption } from '@/features/explore/components/BusinessTypeFilter';
import { cn } from '@/lib/utils';

/**
 * Cuántos rubros se ponen a la vista.
 *
 * Los que hay, hasta ocho. Es una fila que envuelve debajo de un titular: con
 * más, deja de leerse como un atajo y empieza a leerse como un índice, y el
 * índice completo está en `/explore`, que para eso tiene su filtro. El orden lo
 * decide `typeOptions` —el rubro con más negocios primero—, así que los que
 * quedan afuera son siempre los que menos se buscan.
 */
const MAX_SHORTCUTS = 8;

/**
 * Los rubros debajo del campo: enlaces, y nada más.
 *
 * Repite lo que ofrece el desplegable, y a propósito. Son la única parte de la
 * pantalla que funciona sin JavaScript —el panel del campo abre con estado— y
 * son lo que evita que la raíz sea un titular flotando sobre nada: un campo
 * vacío no dice qué hay adentro, ocho rubros sí.
 *
 * **Con menos de dos rubros no se dibuja nada**, la misma regla que el filtro de
 * `/explore`: un único rubro y "Ver todos" son la misma lista dos veces.
 */
export function TypeShortcuts({
	options,
	className,
}: {
	options: BusinessTypeOption[];
	className?: string;
}) {
	if (options.length < 2) return null;

	return (
		<nav aria-label={home.shortcuts.label} className={cn(className)}>
			<ul className="flex flex-wrap justify-center gap-2">
				{options.slice(0, MAX_SHORTCUTS).map((option) => (
					<li key={option.type}>
						<Chip href={`/explore?rubro=${encodeURIComponent(option.type)}`}>
							<BusinessTypeIcon type={option.type} className="size-4" />
							{option.label}
						</Chip>
					</li>
				))}

				<li>
					{/*
					 * La salida a la lista completa, al final de la fila y no antes: acá
					 * lo que se ofrece son los rubros, y "todos" es lo que queda cuando
					 * ninguno sirve. En `/explore` va primero porque ahí es el estado
					 * inicial del filtro.
					 */}
					<Chip
						href="/explore"
						className="border-transparent font-medium text-ink-950 underline underline-offset-4"
					>
						{home.shortcuts.all}
					</Chip>
				</li>
			</ul>
		</nav>
	);
}

export default TypeShortcuts;
