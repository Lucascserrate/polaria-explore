import Image from 'next/image';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import type { PublicStaff } from '@/services/booking/types';

/**
 * La foto de un profesional, o sus iniciales.
 *
 * Uno solo para la sección "Equipo" y para el paso de elegir profesional: son
 * el mismo dato en dos tamaños, y dos implementaciones significarían que el
 * mismo profesional aparece con foto en una pantalla y con iniciales en la
 * otra el día que alguien arregle una sola.
 *
 * **Sin foto no queda un hueco**: van las iniciales. Es la misma idea que en la
 * galería del local —donde sin fotos no se dibuja nada— aplicada a un caso
 * distinto: acá el nombre existe siempre, así que hay algo cierto que mostrar,
 * y un círculo vacío en la mitad del equipo se leería como una imagen que no
 * cargó.
 */
export function StaffAvatar({
	member,
	size,
	selected,
	className,
}: {
	member: PublicStaff;
	size: number;
	selected?: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn(
				'relative block shrink-0 overflow-hidden rounded-full',
				selected ? 'bg-white/15' : 'bg-paper-200',
				className,
			)}
			style={{ width: size, height: size }}
		>
			{member.photoUrl ? (
				<Image
					src={member.photoUrl}
					alt={booking.team.photoAlt(member.name)}
					width={size}
					height={size}
					sizes={`${size}px`}
					className="h-full w-full object-cover"
				/>
			) : (
				<span
					aria-hidden="true"
					className={cn(
						'flex h-full w-full items-center justify-center font-medium',
						selected ? 'text-white/80' : 'text-ink-600',
					)}
					style={{ fontSize: Math.round(size * 0.36) }}
				>
					{initials(member.name)}
				</span>
			)}
		</span>
	);
}

/**
 * El círculo de "cualquier profesional", en el paso de elegir.
 *
 * Existe por una razón de alineación, no de decoración: sin él, esa opción es
 * la única fila sin círculo y su nombre arranca 60px a la izquierda de los
 * demás, con lo que la columna de nombres queda quebrada justo en la primera
 * línea. Y es un grupo de gente, no una persona, así que no le corresponden
 * iniciales.
 */
export function AnyStaffAvatar({
	size,
	selected,
}: {
	size: number;
	selected?: boolean;
}) {
	return (
		<span
			className={cn(
				'flex shrink-0 items-center justify-center rounded-full',
				selected ? 'bg-white/15 text-white/80' : 'bg-paper-200 text-ink-500',
			)}
			style={{ width: size, height: size }}
		>
			{/* Dos siluetas, dibujadas acá como el resto de los iconos del repo. */}
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="currentColor"
				style={{
					width: Math.round(size * 0.55),
					height: Math.round(size * 0.55),
				}}
			>
				<circle cx="9" cy="8" r="3.4" />
				<path d="M2.6 19.4c0-3.1 2.9-5.2 6.4-5.2s6.4 2.1 6.4 5.2a.9.9 0 0 1-.9.9H3.5a.9.9 0 0 1-.9-.9Z" />
				<path
					d="M16.4 8.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"
					opacity=".75"
				/>
				<path
					d="M16.6 15.1c2.7 0 4.8 1.6 4.8 3.9a.9.9 0 0 1-.9.9h-3.2c.1-2-.8-3.7-2.2-4.7.5-.1 1-.1 1.5-.1Z"
					opacity=".75"
				/>
			</svg>
		</span>
	);
}

/**
 * Hasta dos iniciales: "Jose Pérez" → "JP", "Carlos" → "C".
 *
 * Se salta lo que no empieza con letra —un apodo entre comillas, un emoji en el
 * nombre— porque una inicial que no es una letra no dice nada. Si no queda
 * ninguna, devuelve cadena vacía y el círculo se ve liso: es mejor que un
 * signo raro.
 */
function initials(name: string): string {
	return name
		.split(/\s+/)
		.map((word) => word.trim())
		.filter((word) => /^\p{L}/u.test(word))
		.slice(0, 2)
		.map((word) => word[0].toUpperCase())
		.join('');
}
