import { Button, buttonClasses } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { bookingHref, profileHref } from '../booking-url';
import { formatDuration, formatServicePrice } from '../format';
import type {
	PublicBusinessProfile,
	PublicService,
} from '@/services/booking/types';

/**
 * Los accesos al flujo de reserva. **Son enlaces, no botones con `onClick`.**
 *
 * Antes eran componentes de cliente que abrían un modal con `useBooking()`.
 * Ahora la reserva es una pantalla con dirección propia
 * (`/[negocio]/reservar`), así que esto vuelve a ser lo que siempre debió ser:
 * un `<a>`. Con eso la página del negocio no tiene una línea de JavaScript
 * propio —salvo la galería— y "Reservar" funciona igual apretando con el botón
 * del medio, abriendo en otra pestaña o compartiendo el enlace.
 */

/** El acceso grande, sin servicio elegido: entra por el primer paso. */
export function BookNowButton({
	slug,
	className,
}: {
	slug: string;
	className?: string;
}) {
	return (
		<Button size="lg" className={className} href={bookingHref(slug)}>
			{booking.services.bookNow}
		</Button>
	);
}

/**
 * Cuántos servicios se ven antes de tener que pedir el resto.
 *
 * Ocho es más o menos lo que entra en una pantalla de teléfono sin que la
 * sección de servicios empuje al horario, a las fotos y a la dirección tan abajo
 * que nadie llegue: hay negocios con treinta, y una lista de treinta filas
 * convierte al resto de la página en algo que existe pero no se visita.
 */
const VISIBLE_SERVICES = 8;

/**
 * La lista de servicios.
 *
 * Es la sección más importante de la página y por eso va arriba de todo: la
 * pregunta que trae a alguien acá es "¿cuánto sale y cuándo puedo ir?", y las
 * dos se responden en la misma fila. Tocar "Reservar" acá entra al flujo con el
 * servicio ya elegido —viaja en la URL—, que es lo que ahorra el paso más
 * largo.
 */
export function ServiceList({
	profile,
	/** La categoría del filtro, tal como vino en la URL. */
	activeCategory,
}: {
	profile: PublicBusinessProfile;
	activeCategory?: string;
}) {
	if (profile.services.length === 0) {
		return (
			<p className="rounded-2xl bg-paper-200 px-5 py-6 text-ink-600">
				{booking.services.empty}
			</p>
		);
	}

	/*
	 * Una categoría que no existe se ignora en vez de dejar la lista vacía. La
	 * URL la puede escribir cualquiera, y sobre todo: un enlace a una categoría
	 * que el negocio borró después no puede terminar en una página que parece
	 * decir que no hay servicios.
	 */
	const categories = profile.categories ?? [];

	const active = categories.some((category) => category.id === activeCategory)
		? activeCategory
		: undefined;

	const services = active
		? profile.services.filter((service) => service.categoryId === active)
		: profile.services;

	/*
	 * El corte va **después** de filtrar: quien entró por "Color" tiene que ver
	 * los primeros ocho de color, no los que sobrevivieron al filtro de una lista
	 * ya recortada.
	 */
	const visible = services.slice(0, VISIBLE_SERVICES);
	const hidden = services.slice(VISIBLE_SERVICES);

	return (
		<div className="space-y-4">
			<CategoryFilter profile={profile} active={active} />

			<ul className="space-y-3">
				{visible.map((service) => (
					<li key={service.id}>
						<ServiceRow service={service} slug={profile.slug} />
					</li>
				))}
			</ul>

			{hidden.length > 0 && (
				<ServiceOverflow services={hidden} slug={profile.slug} />
			)}
		</div>
	);
}

/**
 * Los filtros por categoría, como enlaces.
 *
 * Enlaces y no botones con estado, igual que el filtro de rubros y que
 * "Reservar": la página del negocio no tiene JavaScript propio, y con esto
 * sigue sin tenerlo. De paso cada categoría queda con dirección propia, así que
 * un negocio puede mandar "mirá los tintes" y caer con el filtro puesto.
 *
 * No se dibuja si no hay más de un grupo que distinguir: con una sola categoría
 * y nada fuera de ella, los dos filtros muestran exactamente lo mismo.
 *
 * Tampoco hay una píldora de "otros". Los servicios sin categoría no quedan
 * escondidos porque "Todos" es lo que rige al entrar, así que agregar una
 * píldora más sólo sumaría ruido a la fila.
 */
function CategoryFilter({
	profile,
	active,
}: {
	profile: PublicBusinessProfile;
	active?: string;
}) {
	const categories = profile.categories ?? [];
	const hasUncategorized = profile.services.some(
		(service) => !service.categoryId,
	);
	const groups = categories.length + (hasUncategorized ? 1 : 0);

	if (groups < 2) return null;

	return (
		/*
		 * Se arrastra con el dedo en el teléfono, donde cinco categorías no entran
		 * en el ancho. Los márgenes negativos son para que la primera y la última
		 * lleguen al borde en lugar de cortarse contra el padding, y por eso van con
		 * la misma medida que el padding del `Container` (`px-5`): con `-mx-4` la
		 * fila quedaba cuatro píxeles corrida de todo lo demás.
		 *
		 * `min-w-0` porque un carrusel adentro de una grilla no alcanza con que sepa
		 * desbordar: si la columna mide por el contenido, la que se ensancha es la
		 * página. `overscroll-x-contain` para que llegar al final de la fila no
		 * dispare el gesto de "atrás" del navegador.
		 *
		 * La barra de scroll va escondida, igual que en el filtro de rubros y en la
		 * galería: en el teléfono el navegador la dibuja sola mientras se arrastra,
		 * y en el escritorio la fila ya no desborda porque se acomoda en varias
		 * líneas.
		 */
		<div className="-mx-5 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
			<Chip
				href={profileHref(profile.slug)}
				active={active === undefined}
				scroll={false}
			>
				{booking.services.allCategories}
			</Chip>

			{categories.map((category) => (
				<Chip
					key={category.id}
					href={profileHref(profile.slug, category.id)}
					active={active === category.id}
					// La lista ya está a la vista: saltar arriba al filtrar haría
					// perder de vista justo lo que se acaba de pedir.
					scroll={false}
				>
					{category.name}
				</Chip>
			))}
		</div>
	);
}

/**
 * Los servicios que no entraron, detrás de "Ver más".
 *
 * **Es un `<details>` y no un botón con estado**, por las dos razones que ya
 * mandan en esta página. La primera: acá no hay JavaScript propio —"Reservar"
 * es un `<a>`, el filtro de categorías son enlaces— y un `useState` obligaría a
 * convertir la lista en un componente de cliente para abrir un acordeón.
 *
 * La segunda importa más y es la que descartó la otra alternativa obvia, mandar
 * el resto a `?servicios=todos`: **las filas escondidas siguen estando en el
 * HTML**. Esta es la página que tiene que aparecer en Google —es la que
 * responde "qué ofrece y cuánto sale"— y con el resto detrás de otra dirección,
 * el buscador vería ocho servicios de treinta. Un `<details>` cerrado esconde
 * con CSS, no con la red.
 *
 * El botón queda **arriba** de lo que despliega, y no es un descuido: el
 * `<summary>` tiene que ser el primer hijo del `<details>`, y moverlo con
 * `order` obliga a ponerle `display: flex` al `<details>`, que es exactamente lo
 * que Safari rompe —el contenido se queda visible con el desplegable cerrado—.
 * Cerrado igual se lee donde el diseño lo pide: al pie de los ocho.
 */
function ServiceOverflow({
	services,
	slug,
}: {
	services: PublicService[];
	slug: string;
}) {
	return (
		<details className="group">
			<summary
				className={buttonClasses({
					variant: 'secondary',
					className:
						'w-full cursor-pointer list-none [&::-webkit-details-marker]:hidden',
				})}
			>
				{/*
				 * Las dos leyendas van en el HTML y se turnan con CSS. Cambiarla al
				 * abrir necesitaría JavaScript, y dejar "Ver más" con la lista ya
				 * desplegada sería un botón que miente sobre lo que hace.
				 */}
				<span className="group-open:hidden">
					{booking.services.seeMore(services.length)}
				</span>
				<span className="hidden group-open:inline">
					{booking.services.seeLess}
				</span>

				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="size-4 transition-transform group-open:rotate-180"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</summary>

			<ul className="mt-3 space-y-3">
				{services.map((service) => (
					<li key={service.id}>
						<ServiceRow service={service} slug={slug} />
					</li>
				))}
			</ul>
		</details>
	);
}

function ServiceRow({
	service,
	slug,
}: {
	service: PublicService;
	slug: string;
}) {
	return (
		<div
			className={cn(
				'flex items-center justify-between gap-4 rounded-2xl px-5 py-5',
				'ring-1 ring-paper-300 ring-inset transition-colors hover:bg-paper-100',
			)}
		>
			<div className="min-w-0">
				<p className="font-medium">{service.name}</p>
				<p className="mt-0.5 text-sm text-ink-500">
					{formatDuration(service.durationMinutes)}
				</p>
				<p
					className={
						service.price === null
							? 'mt-2 text-sm text-ink-500'
							: 'mt-2 font-semibold tabular-nums'
					}
				>
					{formatServicePrice(service.price, service.currency)}
				</p>
			</div>

			<Button
				variant="secondary"
				href={bookingHref(slug, service.id)}
				aria-label={`${booking.services.book} ${service.name}`}
			>
				{booking.services.book}
			</Button>
		</div>
	);
}

/**
 * La barra fija del teléfono.
 *
 * Sólo en pantallas chicas: en el escritorio ese lugar lo ocupa la tarjeta
 * lateral, que además queda siempre a la vista sin tapar contenido. Acá, en
 * cambio, tapar dos centímetros del final de la página es el precio de que
 * "Reservar" esté siempre a un pulgar de distancia.
 */
export function MobileBookingBar({
	profile,
}: {
	profile: PublicBusinessProfile;
}) {
	if (profile.services.length === 0) return null;

	return (
		<div className="sticky bottom-0 z-30 border-t border-paper-300 bg-paper-50/95 px-5 py-3 backdrop-blur lg:hidden">
			<div className="flex items-center justify-between gap-4">
				<p className="text-sm text-ink-600">
					{booking.header.servicesCount(profile.services.length)}
				</p>
				<Button href={bookingHref(profile.slug)}>
					{booking.services.bookNow}
				</Button>
			</div>
		</div>
	);
}
