'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { LayoutGrid, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/content/home';
import { BusinessTypeIcon } from '@/features/explore/business-type-icon';
import type { BusinessTypeOption } from '@/features/explore/components/BusinessTypeFilter';
import { cn } from '@/lib/utils';
import {
	searchOptions,
	type SearchBusiness,
	type SearchOption,
} from '../search-options';

/**
 * El campo de la raíz: se aprieta y baja la lista de rubros.
 *
 * **No es un buscador de texto disfrazado ni un `<select>` con estilo.** Es lo
 * que hacen los marketplaces de citas y no es casualidad: quien llega no sabe
 * qué palabra escribir —"corte", "barbería", "fade" y "peluquería" son la misma
 * intención—, y una lista de rubros le contesta antes de que tenga que
 * adivinarla. Escribir sirve para acortar esa lista y para encontrar un negocio
 * por su nombre, no para lanzar una búsqueda que la API todavía no sabe hacer.
 * Ver `searchOptions`.
 *
 * **Un rubro va a `/explore?rubro=`; un negocio va a su página.** Son las dos
 * cosas que existen, y la segunda es un atajo real: quien ya sabe a qué local
 * quiere ir no tiene por qué pasar por una lista de resultados de uno.
 *
 * **Es un `<form action="/explore">` de verdad.** Con JavaScript nunca se
 * envía: `onSubmit` cancela y navega a la fila elegida. Sin JavaScript el panel
 * no abre —eso sí necesita estado— pero el campo sigue siendo un formulario que
 * lleva a la lista completa, y los rubros quedan a mano en la fila de píldoras
 * de abajo, que son enlaces dibujados en el servidor. Nada de esta pantalla
 * termina en un callejón sin salida.
 *
 * **Todavía no hay "dónde" ni "cuándo".** La referencia tiene tres casilleros y
 * dos de ellos acá serían decoración: la API no filtra por zona ni por fecha, y
 * un "Ubicación actual" que no cambia los resultados es una promesa que la
 * siguiente pantalla incumple. Cuando existan, entran a la derecha del campo.
 */
export function SearchEntry({
	types,
	businesses,
}: {
	/** Los rubros que tienen negocios, ya resueltos en el servidor. */
	types: BusinessTypeOption[];
	businesses: SearchBusiness[];
}) {
	const router = useRouter();
	const listId = useId();
	const root = useRef<HTMLDivElement>(null);
	const activeRow = useRef<HTMLAnchorElement>(null);

	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);

	const groups = useMemo(
		() => searchOptions({ query, types, businesses }),
		[query, types, businesses],
	);

	const options = useMemo(
		() => groups.flatMap((group) => group.options),
		[groups],
	);

	/*
	 * El índice se acota al dibujar en lugar de arreglarse con un efecto cada vez
	 * que cambia la lista: escribir una letra puede dejar tres filas donde había
	 * doce, y un `useEffect` que corrige el estado dibuja una vez con el índice
	 * viejo.
	 */
	const index = Math.min(active, Math.max(options.length - 1, 0));
	const activeOption = options[index] ?? null;

	/* Cerrar con un clic afuera. Escape lo maneja el propio campo. */
	useEffect(() => {
		if (!open) return;

		const onPointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && root.current?.contains(target)) return;

			setOpen(false);
		};

		document.addEventListener('pointerdown', onPointerDown);

		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [open]);

	/* La fila elegida con las flechas tiene que verse: el panel se desplaza. */
	useEffect(() => {
		activeRow.current?.scrollIntoView({ block: 'nearest' });
	}, [index, open]);

	const go = (option: SearchOption | null) => {
		setOpen(false);
		router.push(option?.href ?? '/explore');
	};

	const onKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Escape') {
			setOpen(false);
			return;
		}

		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

		event.preventDefault();

		if (!open) {
			setOpen(true);
			return;
		}

		if (!options.length) return;

		const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
		setActive((next + options.length) % options.length);
	};

	return (
		<div
			ref={root}
			className="relative"
			onBlur={(event) => {
				/*
				 * Cerrar sólo cuando el foco se fue de verdad —con Tab— y no cuando se
				 * apretó una fila: el panel se come el `mousedown`, así que ahí el foco
				 * no se mueve. Sin esa distinción el panel se desmontaría entre el
				 * `mousedown` y el `click`, y el clic no navegaría a ninguna parte.
				 */
				if (root.current?.contains(event.relatedTarget)) return;

				setOpen(false);
			}}
		>
			<form
				action="/explore"
				method="get"
				onSubmit={(event) => {
					event.preventDefault();
					/*
					 * Enter sin haber bajado con las flechas toma la primera fila, que es
					 * la que se está mirando. Con el campo vacío ésa es "Todos los
					 * negocios", así que Enter siempre lleva a alguna parte.
					 */
					go(activeOption ?? options[0] ?? null);
				}}
				className={cn(
					/*
					 * `text-left` porque el titular de arriba centra todo lo que cuelga
					 * de él, y un campo de búsqueda con el cursor en el medio y la lupa
					 * a la izquierda se lee como un error.
					 */
					'flex flex-col gap-2 rounded-3xl bg-paper-50 p-2 text-left ring-1 ring-paper-300',
					'shadow-[0_8px_30px_-12px_rgb(10_10_10/0.12)]',
					'focus-within:ring-2 focus-within:ring-ink-950',
					'sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:pl-5',
				)}
			>
				<div className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-0">
					<Search
						aria-hidden
						className="size-5 shrink-0 text-ink-500"
						strokeWidth={1.75}
					/>

					<input
						name="q"
						type="text"
						role="combobox"
						aria-label={home.search.label}
						aria-expanded={open}
						aria-controls={listId}
						aria-autocomplete="list"
						aria-activedescendant={
							open && activeOption ? optionId(listId, activeOption) : undefined
						}
						autoComplete="off"
						placeholder={home.search.placeholder}
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
							setActive(0);
							setOpen(true);
						}}
						onFocus={() => setOpen(true)}
						onClick={() => setOpen(true)}
						onKeyDown={onKeyDown}
						className="h-12 w-full min-w-0 bg-transparent text-[0.9375rem] text-ink-950 outline-none placeholder:text-ink-500"
					/>
				</div>

				<Button type="submit" size="lg" className="w-full sm:w-auto">
					{home.search.submit}
				</Button>
			</form>

			{open && (
				<div
					// Ver el `onBlur` de arriba: esto es lo que deja el foco quieto.
					onMouseDown={(event) => event.preventDefault()}
					/*
					 * Alto fijo y no `60vh`: el panel no empuja la página —está
					 * posicionado—, así que lo que se sale de la pantalla no se alcanza
					 * desplazando. 26rem entran debajo del campo en un portátil de 900px
					 * y en un teléfono con el teclado abierto; el resto se desplaza
					 * adentro. `overscroll-contain` para que llegar al final no arrastre
					 * la página.
					 */
					className="absolute inset-x-0 top-full z-40 mt-2 max-h-[26rem] overflow-y-auto overscroll-contain rounded-3xl bg-paper-50 py-2 text-left shadow-xl ring-1 ring-paper-300"
				>
					<div id={listId} role="listbox" aria-label={home.search.optionsLabel}>
						{groups.map((group) =>
							group.label === null ? (
								group.options.map((option) => (
									<Row
										key={option.key}
										option={option}
										listId={listId}
										active={option === activeOption}
										activeRef={activeRow}
										onSelect={() => setOpen(false)}
									/>
								))
							) : (
								<div
									key={group.label}
									role="group"
									aria-label={group.label}
									className="mt-1 border-t border-paper-300 pt-2 first:mt-0 first:border-0 first:pt-0"
								>
									<p
										aria-hidden
										className="px-4 pt-1 pb-1.5 text-xs font-medium tracking-wide text-ink-500 uppercase"
									>
										{group.label}
									</p>

									{group.options.map((option) => (
										<Row
											key={option.key}
											option={option}
											listId={listId}
											active={option === activeOption}
											activeRef={activeRow}
											onSelect={() => setOpen(false)}
										/>
									))}
								</div>
							),
						)}
					</div>

					{options.length === 0 && (
						<div className="px-4 py-3">
							<p className="text-sm text-ink-600">
								{home.search.noMatches(query.trim())}
							</p>

							<Link
								href="/explore"
								onClick={() => setOpen(false)}
								className="mt-1 inline-block text-sm font-medium text-ink-950 underline underline-offset-4"
							>
								{home.search.noMatchesAction}
							</Link>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

/*
 * Los dos puntos de la clave son válidos en un `id` pero rompen cualquier
 * selector de CSS que los toque, y este `id` viaja en `aria-activedescendant`.
 */
const optionId = (listId: string, option: SearchOption) =>
	`${listId}-${option.key.replace(/[^\w-]/g, '-')}`;

/**
 * Una fila del panel.
 *
 * **El `role="option"` va en el enlace y no en un envoltorio.** Es un enlace de
 * verdad —se abre en otra pestaña, se copia la dirección— y a la vez la fila
 * que el lector de pantalla anuncia; con el rol afuera habría dos cosas donde
 * hay una, y con un `<div>` en lugar del enlace se perdería todo lo que un
 * enlace sabe hacer.
 *
 * El icono es el del rubro —el mismo que marca al negocio en el mapa de
 * `/explore`— dentro de un círculo gris, y nunca reemplaza a la etiqueta: va
 * con `aria-hidden`, porque ninguno de esos dibujos dice "depilación" solo.
 */
function Row({
	option,
	listId,
	active,
	activeRef,
	onSelect,
}: {
	option: SearchOption;
	listId: string;
	active: boolean;
	activeRef: React.RefObject<HTMLAnchorElement | null>;
	onSelect: () => void;
}) {
	return (
		<Link
			ref={active ? activeRef : undefined}
			id={optionId(listId, option)}
			href={option.href}
			role="option"
			aria-selected={active}
			tabIndex={-1}
			onClick={onSelect}
			className={cn(
				'flex items-center gap-3 px-4 py-2.5 transition-colors',
				active ? 'bg-paper-200' : 'hover:bg-paper-200',
			)}
		>
			<span
				aria-hidden
				className="grid size-9 shrink-0 place-items-center rounded-full bg-paper-200 text-ink-700"
			>
				{option.kind === 'all' ? (
					<LayoutGrid className="size-4" strokeWidth={1.75} />
				) : (
					<BusinessTypeIcon
						type={option.kind === 'type' ? option.type : (option.type ?? 'OTHER')}
						className="size-[1.15rem]"
					/>
				)}
			</span>

			<span className="min-w-0">
				<span className="block truncate text-[0.9375rem] text-ink-950">
					{option.label}
				</span>

				{option.kind === 'business' && option.hint && (
					<span className="block truncate text-sm text-ink-500">
						{option.hint}
					</span>
				)}
			</span>
		</Link>
	);
}

export default SearchEntry;
