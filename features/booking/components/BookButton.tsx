import { Button } from '@/components/ui/button';
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

	return (
		<div className="space-y-4">
			<CategoryFilter profile={profile} active={active} />

			<ul className="space-y-3">
				{services.map((service) => (
					<li key={service.id}>
						<ServiceRow service={service} slug={profile.slug} />
					</li>
				))}
			</ul>
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
