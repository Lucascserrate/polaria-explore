import Image from 'next/image';
import { booking, dayNames, weekOrder } from '@/content/booking';
import { cn } from '@/lib/utils';
import { hasStaticMap } from '@/services/map/static-map';
import { currentDayOfWeek, trimSeconds } from '../format';
import { directionsUrl } from '../location';
import type {
	PublicBusinessProfile,
	WeeklyRange,
} from '@/services/booking/types';

/**
 * Lo que se consulta después de haber decidido reservar: horarios y dirección.
 *
 * Van al final de la página a propósito. Son datos útiles, pero ninguno es la
 * razón por la que alguien abrió el enlace, y ponerlos arriba empuja los
 * servicios —que sí lo son— fuera de la primera pantalla.
 */

export function SchedulePanel({ profile }: { profile: PublicBusinessProfile }) {
	const byDay = groupByDay(profile.businessHours);
	const today = currentDayOfWeek(profile.timezone, new Date());

	return (
		<section aria-labelledby="horarios" className="space-y-4">
			<h2 id="horarios" className="text-xl font-semibold">
				{booking.schedule.title}
			</h2>

			<ul className="divide-y divide-paper-300 rounded-2xl ring-1 ring-paper-300 ring-inset">
				{weekOrder.map((day) => {
					const ranges = byDay.get(day) ?? [];
					const isToday = day === today;

					return (
						<li
							key={day}
							className={cn(
								'flex items-baseline justify-between gap-4 px-5 py-3',
								isToday && 'bg-paper-100',
							)}
						>
							<span
								className={cn(
									'capitalize',
									isToday ? 'font-semibold' : 'text-ink-700',
								)}
							>
								{dayNames[day]}
								{isToday && (
									<span className="ml-2 text-xs font-normal text-ink-500">
										{booking.schedule.today}
									</span>
								)}
							</span>

							{ranges.length === 0 ? (
								<span className="text-sm text-ink-500">
									{booking.schedule.closed}
								</span>
							) : (
								/*
								 * Un día con turno partido se lee como dos franjas en dos
								 * líneas. Unirlas con una coma —"09:00–13:00, 15:00–20:00"— hace
								 * que el cierre del mediodía pase desapercibido, que es
								 * exactamente el dato por el que alguien mira esta tabla.
								 */
								<span className="space-y-0.5 text-right text-sm tabular-nums">
									{ranges.map((range) => (
										<span key={range.startTime} className="block">
											{trimSeconds(range.startTime)} –{' '}
											{trimSeconds(range.endTime)}
										</span>
									))}
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</section>
	);
}

export function LocationPanel({ profile }: { profile: PublicBusinessProfile }) {
	const directions = directionsUrl(profile);

	// Sin dirección ni coordenadas no hay sección: un título con un hueco debajo
	// se lee como una página a medio cargar.
	if (!profile.address && !directions) return null;

	const map =
		Boolean(profile.location) && Boolean(directions) && hasStaticMap();

	return (
		<section aria-labelledby="ubicacion" className="space-y-4">
			<h2 id="ubicacion" className="text-xl font-semibold">
				{booking.location.title}
			</h2>

			<div className="overflow-hidden rounded-2xl ring-1 ring-paper-300 ring-inset">
				{map && directions && (
					<a
						href={directions}
						target="_blank"
						rel="noreferrer"
						className="block border-b border-paper-300"
					>
						<Image
							src={`/api/map/${encodeURIComponent(profile.slug)}`}
							alt={booking.location.mapAlt(profile.name)}
							width={1280}
							height={520}
							sizes="(min-width: 1024px) 40rem, 100vw"
							className="w-full"
						/>
					</a>
				)}

				<div className="space-y-3 px-5 py-5">
					{profile.address && <p className="text-ink-700">{profile.address}</p>}

					{directions && (
						<a
							href={directions}
							target="_blank"
							rel="noreferrer"
							className="inline-flex font-medium text-accent-600 underline-offset-4 hover:underline"
						>
							{booking.location.directions}
						</a>
					)}
				</div>
			</div>
		</section>
	);
}

/**
 * Agrupa las franjas por día y las ordena.
 *
 * El backend ya las manda ordenadas, pero la tabla no puede depender de eso: un
 * día que empieza a las 15:00 y sigue a las 09:00 se lee como un error del
 * negocio cuando en realidad sería un error de la página.
 */
function groupByDay(ranges: WeeklyRange[]): Map<number, WeeklyRange[]> {
	const byDay = new Map<number, WeeklyRange[]>();

	for (const range of ranges) {
		byDay.set(range.dayOfWeek, [...(byDay.get(range.dayOfWeek) ?? []), range]);
	}

	for (const list of byDay.values()) {
		list.sort((a, b) => a.startTime.localeCompare(b.startTime));
	}

	return byDay;
}
