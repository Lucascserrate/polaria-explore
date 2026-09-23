'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import {
	formatDayChip,
	formatDuration,
	formatServicePrice,
	formatTime,
} from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type {
	PublicBusinessProfile,
	PublicService,
	PublicSlot,
	PublicStaff,
} from '@/services/booking/types';
import { MAX_SERVICES_PER_BOOKING } from '@/services/booking/selection';
import { AnyStaffAvatar, PerServiceAvatar, StaffAvatar } from './StaffAvatar';

/**
 * Los pasos en los que se elige: servicios, profesional y horario.
 *
 * Todos comparten la misma forma —una lista de opciones grandes, tocables con
 * el pulgar— porque el flujo se diseñó para el teléfono: la mayoría de la gente
 * llega a esta página desde un enlace de WhatsApp, de Instagram o de un QR
 * pegado en el mostrador. En una pantalla ancha las mismas listas se ven
 * holgadas, que es el problema barato de los dos.
 *
 * **El de servicios es el único de marcar y no de elegir**, y esa diferencia se
 * ve: sus filas no avanzan al tocarlas, se tildan. Lo que avanza es el botón de
 * la barra de abajo (`BookingBar`), que además es la única señal de que se puede
 * marcar más de uno.
 */

/**
 * Lo que cada paso avisa hacia arriba.
 *
 * Están juntos para que los pasos tomen su función de acá con
 * `Handlers['onSelectStaff']` en lugar de repetir la firma. Confirmar no está:
 * ese paso vive en `ConfirmStep` y declara la suya, que además cambia según
 * haya cuenta o no.
 */
type Handlers = {
	onToggleService: (service: PublicService) => void;
	onSelectStaff: (staff: PublicStaff | null) => void;
	onSelectStaffPerService: () => void;
	onSelectDate: (date: string) => void;
	onSelectSlot: (slot: PublicSlot) => void;
};

/** Fila tocable: la unidad de todas las listas del flujo. */
function OptionRow({
	title,
	meta,
	hint,
	leading,
	selected,
	onClick,
}: {
	title: string;
	meta?: string;
	hint?: string;
	leading?: React.ReactNode;
	selected?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left',
				'ring-1 ring-paper-300 ring-inset transition-colors',
				'hover:bg-paper-200 active:bg-paper-300',
				selected && 'bg-ink-950 text-white ring-ink-950 hover:bg-ink-900',
			)}
			aria-pressed={selected}
		>
			{leading}

			<span className="min-w-0 flex-1">
				<span className="block truncate font-medium">{title}</span>
				{hint && (
					<span
						className={cn(
							'mt-0.5 block truncate text-sm',
							selected ? 'text-white/70' : 'text-ink-500',
						)}
					>
						{hint}
					</span>
				)}
			</span>
			{meta && (
				<span
					className={cn(
						'shrink-0 text-sm tabular-nums',
						selected ? 'text-white/80' : 'text-ink-600',
					)}
				>
					{meta}
				</span>
			)}
		</button>
	);
}

/**
 * El paso de servicios: una lista de marcar.
 *
 * **La fila marcada no se pinta entera de negro**, al revés que en los otros
 * pasos, y la diferencia es de significado: ahí el negro señala la única opción
 * elegida, y acá puede haber tres marcadas a la vez. Tres filas negras seguidas
 * se leen como un bloque y no como una lista, así que lo marcado se dice con el
 * borde y con el círculo de la derecha —el mismo lugar donde estaba el `+` que
 * se acaba de tocar—.
 */
/**
 * Cuánto tapa la barra de abajo, en píxeles.
 *
 * Es el hueco que `BookingScreen` le reserva con `pb-28` mientras el paso de
 * servicios está en pantalla. Vale para una sola cosa —decidir si una fila se ve
 * de verdad o está debajo de la barra— y por eso alcanza con el número en lugar
 * de medir la barra, que además vive en otro componente.
 */
const BAR_HEIGHT = 112;

type ServiceGroup = {
	id: string;
	name: string;
	services: PublicService[];
};

const UNCATEGORIZED = 'otros';

/**
 * El catálogo partido en categorías, o nada.
 *
 * **Nada quiere decir "mostralo como una lista sola"**, y es el caso de casi
 * todos los negocios: sin categorías, o con una, partir la lista sería ponerle
 * un título a lo único que hay. Es la misma regla que usa la página del negocio
 * para no dibujar el filtro (`CategoryFilter`), y tiene que ser la misma: la
 * lista de allá y la de acá son el mismo catálogo con dos toques de distancia.
 *
 * Un servicio cuya categoría no llegó en `profile.categories` **no se pierde**:
 * cae en "Otros" junto a los que no tienen ninguna. Quedarse sólo con las
 * categorías conocidas dejaría un servicio imposible de reservar, sin error y
 * sin que nadie se entere.
 */
function groupServices(profile: PublicBusinessProfile): ServiceGroup[] {
	const categories = profile.categories ?? [];
	if (categories.length === 0) return [];

	const known = new Set(categories.map((category) => category.id));

	// Las categorías llegan ordenadas por el negocio; los servicios, en el orden
	// del catálogo. Ninguno de los dos órdenes se toca acá.
	const groups: ServiceGroup[] = categories
		.map((category) => ({
			id: category.id,
			name: category.name,
			services: profile.services.filter(
				(service) => service.categoryId === category.id,
			),
		}))
		.filter((group) => group.services.length > 0);

	const loose = profile.services.filter(
		(service) => !service.categoryId || !known.has(service.categoryId),
	);

	if (loose.length > 0) {
		groups.push({
			id: UNCATEGORIZED,
			name: booking.flow.service.uncategorized,
			services: loose,
		});
	}

	return groups.length > 1 ? groups : [];
}

/** Cómo desplazar: quieto si la persona pidió menos movimiento. */
function scrollBehavior(): ScrollBehavior {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
		? 'auto'
		: 'smooth';
}

/**
 * El paso de servicios: una lista de marcar.
 *
 * **La fila marcada no se pinta entera de negro**, al revés que en los otros
 * pasos, y la diferencia es de significado: ahí el negro señala la única opción
 * elegida, y acá puede haber tres marcadas a la vez. Tres filas negras seguidas
 * se leen como un bloque y no como una lista, así que lo marcado se dice con el
 * borde y con el círculo de la derecha —el mismo lugar donde estaba el `+` que
 * se acaba de tocar—.
 *
 * **Con categorías la lista se parte en secciones y arriba va una fila que lleva
 * a cada una.** No es un filtro: no esconde nada, no saca las otras del medio y
 * no cambia lo que hay para marcar. Tocar una categoría desplaza hasta su
 * título, que es lo que hace falta cuando el catálogo tiene cuarenta servicios y
 * los tintes están en el fondo.
 *
 * **Lo marcado nunca se mueve de lugar.** Entrar desde un servicio concreto
 * desplaza la pantalla hasta esa fila —ver `openedWith`— en vez de subirla al
 * principio de la lista: subir lo elegido deja a la persona sin el lugar donde
 * estaba parada, y con dos o tres marcados la lista se reordenaría debajo del
 * dedo cada vez que se toca algo.
 */
export function ServiceStep({
	profile,
	state,
	onToggleService,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
	onToggleService: Handlers['onToggleService'];
}) {
	const chosen = new Set(state.services.map((service) => service.id));

	/*
	 * Al llegar al tope, lo que no está marcado se apaga en vez de rechazar el
	 * toque en silencio: una fila que no reacciona se lee como un error de la
	 * página. Lo ya marcado sigue tocándose, porque sacar algo es justamente la
	 * salida de este estado.
	 */
	const full = chosen.size >= MAX_SERVICES_PER_BOOKING;

	const groups = useMemo(() => groupServices(profile), [profile]);

	const strip = useRef<HTMLDivElement>(null);
	const sections = useRef(new Map<string, HTMLElement>());
	const rows = useRef(new Map<string, HTMLElement>());

	const [active, setActive] = useState(() => groups[0]?.id);

	/**
	 * Con qué servicio se abrió el paso.
	 *
	 * Se lee una sola vez, en el primer render: es el que venía en la URL al
	 * entrar —`bookingHref(slug, service.id)`— y no tiene que cambiar cuando se
	 * marca otro. Lo usa el desplazamiento de abajo, que corre una vez y no vuelve
	 * a correr en toda la vida del paso.
	 */
	const [openedWith] = useState(() => state.services[0]?.id ?? null);

	/**
	 * Entrar desde un servicio lo deja a la vista.
	 *
	 * Es el único feedback de que se marcó lo que se tocó: la fila llega tildada
	 * desde el primer pintado, pero si es la número doce del catálogo queda muy
	 * abajo, y la pantalla abre arriba de todo —en una lista donde no se ve nada
	 * elegido—.
	 *
	 * **Si ya se ve, no se mueve nada.** Quien entró desde el primer servicio no
	 * tiene por qué ver saltar la pantalla, y un desplazamiento que no hacía falta
	 * se lee como un error.
	 */
	useEffect(() => {
		if (!openedWith) return;

		const row = rows.current.get(openedWith);
		if (!row) return;

		const box = row.getBoundingClientRect();
		const top = strip.current?.getBoundingClientRect().bottom ?? 0;
		const bottom = window.innerHeight - BAR_HEIGHT;

		if (box.top >= top && box.bottom <= bottom) return;

		// `center` y no `start`: la fila queda en el medio, con vecinas arriba y
		// abajo, que es lo que dice "esto es una lista y ésta es la tuya" en lugar
		// de "esto es lo primero que hay".
		row.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
	}, [openedWith]);

	/**
	 * Qué categoría se está mirando.
	 *
	 * Sale de dónde quedó la página y no de cuál se tocó, así que la fila de
	 * arriba dice lo mismo se haya llegado tocando una categoría o desplazando con
	 * el dedo. Es la última sección cuyo título ya pasó por debajo de la fila, que
	 * es donde está mirando la persona.
	 *
	 * La línea se mide contra la fila misma y no contra un número: pegada arriba
	 * mide distinto en el teléfono que en escritorio, donde además tiene la barra
	 * del sitio encima.
	 */
	useEffect(() => {
		if (groups.length === 0) return;

		let frame = 0;

		const update = () => {
			frame = 0;

			const line = (strip.current?.getBoundingClientRect().bottom ?? 0) + 1;
			let current = groups[0].id;

			for (const group of groups) {
				const section = sections.current.get(group.id);
				if (section && section.getBoundingClientRect().top <= line) {
					current = group.id;
				}
			}

			setActive(current);
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [groups]);

	const row = (service: PublicService) => (
		<ServiceRow
			key={service.id}
			service={service}
			selected={chosen.has(service.id)}
			disabled={full && !chosen.has(service.id)}
			onClick={() => onToggleService(service)}
			rowRef={(node) => {
				if (node) rows.current.set(service.id, node);
				else rows.current.delete(service.id);
			}}
		/>
	);

	return (
		<div className="space-y-4">
			{groups.length > 0 && (
				<CategoryTabs
					ref={strip}
					groups={groups}
					active={active}
					onSelect={(id) => {
						sections.current.get(id)?.scrollIntoView({
							behavior: scrollBehavior(),
							block: 'start',
						});
					}}
				/>
			)}

			{full && <EmptyNote>{booking.flow.service.full}</EmptyNote>}

			{groups.length === 0 ? (
				<div className="space-y-2">{profile.services.map(row)}</div>
			) : (
				<div className="space-y-8">
					{groups.map((group) => (
						<section
							key={group.id}
							ref={(node) => {
								if (node) sections.current.set(group.id, node);
								else sections.current.delete(group.id);
							}}
							/*
							 * El aire de arriba al desplazar hasta acá: lo que mide la fila de
							 * categorías pegada al borde, más la barra del sitio de `sm` en
							 * adelante. Sin esto el título queda debajo de la fila y parece
							 * cortado.
							 */
							className="scroll-mt-18 space-y-2 sm:scroll-mt-36"
						>
							<h3 className="text-sm font-semibold tracking-wide text-ink-500 uppercase">
								{group.name}
							</h3>

							<div className="space-y-2">{group.services.map(row)}</div>
						</section>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * La fila de categorías: lleva a una sección, no filtra.
 *
 * **Botones y no enlaces**, que es lo contrario de lo que hace el filtro de la
 * página del negocio, y por una razón concreta: un `href="#tintes"` deja una
 * entrada en el historial por cada categoría tocada, y en esta pantalla el botón
 * de atrás es cómo se vuelve al paso anterior. Tres toques de curiosidad en la
 * lista dejarían "Volver" sin volver a ninguna parte. Por lo mismo no es `Chip`,
 * que es siempre un enlace y a propósito.
 *
 * Se queda pegada arriba mientras la lista pasa por debajo. Sin eso habría que
 * subir hasta el principio para saltar a otra categoría, que es exactamente el
 * viaje que esta fila existe para ahorrar.
 */
function CategoryTabs({
	ref,
	groups,
	active,
	onSelect,
}: {
	ref: React.Ref<HTMLDivElement>;
	groups: ServiceGroup[];
	active?: string;
	onSelect: (id: string) => void;
}) {
	const tabs = useRef(new Map<string, HTMLElement>());

	/*
	 * La categoría que se está mirando tiene que verse en la fila. Con seis
	 * categorías, desplazar hasta la última dejaba la marcada fuera de pantalla y
	 * la fila entera diciendo lo que no era.
	 */
	useEffect(() => {
		if (!active) return;

		tabs.current.get(active)?.scrollIntoView({
			behavior: scrollBehavior(),
			// `nearest` en los dos ejes: corre la fila de costado sólo si hace falta,
			// y nunca la página, que en este momento está yendo a otro lado.
			block: 'nearest',
			inline: 'nearest',
		});
	}, [active]);

	return (
		<div
			ref={ref}
			role="group"
			aria-label={booking.flow.service.categoriesLabel}
			/*
			 * Los márgenes negativos son los del `Container` en el teléfono: para que
			 * la primera y la última lleguen al borde en lugar de cortarse contra el
			 * padding, y para que el fondo tape la lista de lado a lado cuando la fila
			 * queda pegada arriba.
			 *
			 * `sm:top-18` es el alto de la barra del sitio (`Navbar`, `sm:h-18`), que
			 * de `sm` en adelante está pegada arriba y con más `z` que esto. En el
			 * teléfono no se dibuja —`SiteHeader showFrom="sm"`— y la fila va al borde.
			 * Si la barra cambia de alto, esto y los `scroll-mt` de las secciones
			 * cambian con ella.
			 */
			className="sticky top-0 z-20 -mx-5 flex gap-2 overflow-x-auto overscroll-x-contain bg-paper-50 px-5 py-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:top-18 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
		>
			{groups.map((group) => (
				<button
					key={group.id}
					type="button"
					ref={(node) => {
						if (node) tabs.current.set(group.id, node);
						else tabs.current.delete(group.id);
					}}
					onClick={() => onSelect(group.id)}
					aria-current={group.id === active ? 'true' : undefined}
					className={cn(
						'shrink-0 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors',
						group.id === active
							? 'border-ink-950 bg-ink-950 text-paper-50'
							: 'border-paper-300 text-ink-700 hover:border-paper-400 hover:bg-paper-200',
					)}
				>
					{group.name}
				</button>
			))}
		</div>
	);
}

function ServiceRow({
	service,
	selected,
	disabled,
	onClick,
	rowRef,
}: {
	service: PublicService;
	selected: boolean;
	disabled: boolean;
	onClick: () => void;
	/** Para poder desplazar hasta la fila que vino marcada. Ver `openedWith`. */
	rowRef?: (node: HTMLElement | null) => void;
}) {
	return (
		<button
			ref={rowRef}
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-pressed={selected}
			aria-label={
				selected
					? booking.flow.service.remove(service.name)
					: booking.flow.service.add(service.name)
			}
			className={cn(
				'flex w-full items-start justify-between gap-4 rounded-2xl px-4 py-4 text-left',
				'ring-inset transition-colors',
				selected ? 'ring-2 ring-ink-950' : 'ring-1 ring-paper-300',
				disabled ? 'opacity-40' : 'hover:bg-paper-200 active:bg-paper-300',
			)}
		>
			<span className="min-w-0 flex-1">
				<span className="block font-medium">{service.name}</span>
				<span className="mt-0.5 block text-sm text-ink-500">
					{formatDuration(service.durationMinutes)}
				</span>
				{/*
				 * La descripción se recorta a dos líneas. Es la que el negocio escribió
				 * para su catálogo y puede ser un párrafo: entera, una sola fila
				 * ocuparía la pantalla y la lista dejaría de poder recorrerse.
				 */}
				{service.description && (
					<span className="mt-2 line-clamp-2 block text-sm text-ink-600">
						{service.description}
					</span>
				)}
				<span
					className={cn(
						'mt-2 block',
						service.price === null
							? 'text-sm text-ink-500'
							: 'font-semibold tabular-nums',
					)}
				>
					{formatServicePrice(service.price, service.currency)}
				</span>
			</span>

			{/*
			 * El círculo es `aria-hidden`: lo que hace la fila ya lo dice su
			 * `aria-label`, y `aria-pressed` dice si está marcada. Anunciarlo tres
			 * veces es peor que una.
			 */}
			<span
				aria-hidden="true"
				className={cn(
					'mt-1 grid size-8 shrink-0 place-items-center rounded-full transition-colors',
					selected
						? 'bg-ink-950 text-white'
						: 'text-ink-700 ring-1 ring-paper-300 ring-inset',
				)}
			>
				<svg
					viewBox="0 0 24 24"
					className="size-4"
					fill="none"
					stroke="currentColor"
					strokeWidth={2.5}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{selected ? (
						<path d="m5 13 4 4L19 7" />
					) : (
						<path d="M12 5v14M5 12h14" />
					)}
				</svg>
			</span>
		</button>
	);
}
export function StaffStep({
	state,
	onSelectStaff,
	onSelectStaffPerService,
}: {
	state: BookingFlowState;
	onSelectStaff: Handlers['onSelectStaff'];
	onSelectStaffPerService: Handlers['onSelectStaffPerService'];
}) {
	if (state.loading && state.staffOptions.length === 0) return <StepSkeleton />;

	/*
	 * Repartir sólo tiene sentido con más de un servicio: con uno, "uno por
	 * servicio" y "uno para todo" son la misma pregunta hecha dos veces.
	 */
	const canSplit = state.services.length > 1;

	/*
	 * Nadie hace todo lo elegido. No es un callejón —la reserva existe repartida—
	 * así que en lugar de una lista vacía se explica y queda la fila que resuelve.
	 */
	const noneShared = state.staffOptions.length === 0;

	if (noneShared && !canSplit) {
		return <EmptyNote>{booking.flow.staff.empty}</EmptyNote>;
	}

	return (
		<div className="space-y-2">
			{noneShared && <EmptyNote>{booking.flow.staff.noneShared}</EmptyNote>}

			{/*
			 * "Cualquier profesional" va primero y no al final: es la opción con más
			 * horarios y la que elige la mayoría de la gente que no tiene preferencia,
			 * que en una barbería es casi todo el mundo la primera vez.
			 *
			 * Con varios servicios sigue queriendo decir **una sola persona para
			 * todo**, elegida por el servidor. Repartir es la fila de abajo, y es una
			 * decisión distinta que hay que tomar a propósito.
			 */}
			{!noneShared && (
				<OptionRow
					title={booking.flow.staff.any}
					hint={booking.flow.staff.anyHint}
					leading={
						<AnyStaffAvatar
							size={44}
							selected={state.staffChoice.kind === 'any'}
						/>
					}
					selected={state.staffChoice.kind === 'any'}
					onClick={() => onSelectStaff(null)}
				/>
			)}

			{canSplit && (
				<OptionRow
					title={booking.flow.staff.perService}
					hint={booking.flow.staff.perServiceHint}
					leading={<PerServiceAvatar size={44} selected={false} />}
					onClick={onSelectStaffPerService}
				/>
			)}

			{state.staffOptions.map((member) => (
				<OptionRow
					key={member.id}
					title={member.name}
					hint={member.jobTitle ?? undefined}
					leading={
						<StaffAvatar
							member={member}
							size={44}
							selected={state.staff?.id === member.id}
						/>
					}
					selected={state.staff?.id === member.id}
					onClick={() => onSelectStaff(member)}
				/>
			))}
		</div>
	);
}

export function SlotStep({
	profile,
	state,
	onSelectDate,
	onSelectSlot,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
	onSelectDate: Handlers['onSelectDate'];
	onSelectSlot: Handlers['onSelectSlot'];
}) {
	if (state.days.length === 0) {
		return state.loading ? (
			<StepSkeleton />
		) : (
			<EmptyNote>{booking.flow.slot.noDays}</EmptyNote>
		);
	}

	return (
		<div className="space-y-6">
			{/*
			 * Tira horizontal en lugar de un calendario mensual. Reservar un turno es
			 * casi siempre "esta semana": una grilla de treinta días obliga a leer un
			 * mes entero para elegir el jueves.
			 */}
			<div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
				{state.days.map((day) => {
					const chip = formatDayChip(day, profile.timezone);
					const selected = state.date === day;

					return (
						<button
							key={day}
							type="button"
							onClick={() => onSelectDate(day)}
							aria-pressed={selected}
							className={cn(
								'flex w-16 shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl py-3',
								'ring-1 ring-paper-300 ring-inset transition-colors',
								selected
									? 'bg-ink-950 text-white ring-ink-950'
									: 'hover:bg-paper-200',
							)}
						>
							<span
								className={cn(
									'text-xs',
									selected ? 'text-white/70' : 'text-ink-500',
								)}
							>
								{chip.weekday}
							</span>
							<span className="text-lg leading-none font-semibold tabular-nums">
								{chip.day}
							</span>
							<span
								className={cn(
									'text-xs',
									selected ? 'text-white/70' : 'text-ink-500',
								)}
							>
								{chip.month}
							</span>
						</button>
					);
				})}
			</div>

			{state.loading ? (
				<StepSkeleton />
			) : state.slots.length === 0 ? (
				<EmptyNote>{booking.flow.slot.empty}</EmptyNote>
			) : (
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
					{state.slots.map((slot) => (
						<button
							key={slot.startTime}
							type="button"
							onClick={() => onSelectSlot(slot)}
							className={cn(
								'rounded-xl py-3 text-center text-sm font-medium tabular-nums',
								'ring-1 ring-paper-300 ring-inset transition-colors',
								'hover:bg-ink-950 hover:text-white hover:ring-ink-950',
							)}
						>
							{formatTime(slot.startTime, profile.timezone)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------

export function EmptyNote({ children }: { children: React.ReactNode }) {
	return (
		<p className="rounded-2xl bg-paper-200 px-5 py-6 text-center text-ink-600">
			{children}
		</p>
	);
}

/**
 * Espera con la forma de lo que viene, no con un cartel de "cargando".
 *
 * Tres barras del alto de una fila: la lista aparece en el mismo lugar donde ya
 * estaba el hueco, así que la pantalla no salta cuando llega la respuesta.
 */
export function StepSkeleton() {
	return (
		<div className="space-y-2" aria-live="polite" aria-busy="true">
			<span className="sr-only">{booking.flow.slot.loading}</span>
			{[0, 1, 2].map((row) => (
				<div
					key={row}
					className="h-16 animate-pulse rounded-2xl bg-paper-200"
				/>
			))}
		</div>
	);
}
