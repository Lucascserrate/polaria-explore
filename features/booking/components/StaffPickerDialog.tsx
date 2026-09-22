'use client';

import { useEffect } from 'react';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { ANY_STAFF } from '../booking-url';
import type { PublicService, PublicStaff } from '@/services/booking/types';
import { AnyStaffAvatar, StaffAvatar } from './StaffAvatar';

/**
 * Quién hace **este** servicio: la hoja que se abre desde una fila del paso de
 * repartir.
 *
 * Es una hoja y no una lista desplegada en la tarjeta por una razón de espacio:
 * con tres servicios y seis profesionales, tres listas abiertas son dieciocho
 * filas que hay que recorrer para cambiar una sola cosa. Acá cada tarjeta se
 * mantiene en una línea y la lista aparece sólo cuando se la pide.
 *
 * Y es una hoja propia, no un `<select>`. El nativo ya funcionaba —abre la
 * rueda del sistema, anda con lector de pantalla— pero no puede mostrar la foto
 * del profesional ni su puesto, que es justamente lo que alguien mira para
 * elegir a quién le corta el pelo. En una pantalla cuyo trabajo es elegir
 * personas, una lista de nombres a secas es menos información de la que hay.
 *
 * **Tocar una fila elige y cierra.** No hay un botón "Seleccionar" por fila
 * —como sí tiene la referencia— porque en este flujo se avanza tocando la
 * opción: un botón adentro de una fila tocable son dos blancos para lo mismo, y
 * el de afuera termina pareciendo decorativo.
 */
export function StaffPickerDialog({
	service,
	options,
	/** El elegido, o `ANY_STAFF`. Nunca vacío: la fila arranca en "cualquiera". */
	current,
	onSelect,
	onClose,
}: {
	service: PublicService;
	options: PublicStaff[];
	current: string;
	onSelect: (staffId: string) => void;
	onClose: () => void;
}) {
	/** Escape cierra, y el fondo no se desplaza mientras esto está abierto. */
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', onKeyDown);
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previous;
		};
	}, [onClose]);

	const choose = (staffId: string) => {
		onSelect(staffId);
		onClose();
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="titulo-profesional"
			className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 sm:items-center sm:p-6"
		>
			{/*
			 * Pegada al borde inferior en el teléfono y centrada en escritorio, igual
			 * que `PhoneDialog`: es donde llega el pulgar y donde está la mirada.
			 *
			 * `dvh` y no `vh` para el alto máximo: en Safari de iOS, `100vh` cuenta la
			 * barra de direcciones que después se retrae, así que la hoja nace más
			 * alta que la pantalla y el último profesional queda debajo del borde.
			 */
			}
			<div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl bg-paper-50 sm:rounded-3xl">
				<div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
					<div className="min-w-0 space-y-1">
						<h2 id="titulo-profesional" className="text-2xl font-semibold">
							{service.name}
						</h2>
						<p className="text-sm text-ink-600">
							{booking.flow.staffPerService.dialogHint}
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label={booking.flow.close}
						className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-paper-200"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
						>
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					</button>
				</div>

				{/*
				 * La lista se desplaza dentro de la hoja y el encabezado se queda: con
				 * ocho profesionales, el nombre del servicio se perdería arriba y no se
				 * sabría para cuál se está eligiendo.
				 *
				 * `overscroll-contain` para que llegar al final de la lista no empiece a
				 * mover la página de atrás.
				 */}
				<div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
					{/*
					 * "Cualquier profesional" primero, como en el paso anterior: es la
					 * opción con más horarios y con la que la fila arranca.
					 */}
					<PickerRow
						title={booking.flow.staff.any}
						hint={booking.flow.staff.anyHint}
						avatar={<AnyStaffAvatar size={44} />}
						selected={current === ANY_STAFF}
						onClick={() => choose(ANY_STAFF)}
					/>

					{options.map((member) => (
						<PickerRow
							key={member.id}
							title={member.name}
							hint={member.jobTitle ?? undefined}
							avatar={<StaffAvatar member={member} size={44} />}
							selected={current === member.id}
							onClick={() => choose(member.id)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * Una opción de la hoja.
 *
 * Lo elegido se marca con el borde y un tilde, y **no pintando la fila de
 * negro** como en los pasos de la pantalla: acá la fila lleva una foto, y un
 * fondo negro detrás de una cara la convierte en un recorte.
 */
function PickerRow({
	title,
	hint,
	avatar,
	selected,
	onClick,
}: {
	title: string;
	hint?: string;
	avatar: React.ReactNode;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			className={cn(
				'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left',
				'ring-inset transition-colors hover:bg-paper-200 active:bg-paper-300',
				selected ? 'ring-2 ring-ink-950' : 'ring-1 ring-paper-300',
			)}
		>
			{avatar}

			<span className="min-w-0 flex-1">
				<span className="block truncate font-medium">{title}</span>
				{hint && (
					<span className="mt-0.5 block truncate text-sm text-ink-500">
						{hint}
					</span>
				)}
			</span>

			{/* El tilde es decorativo: `aria-pressed` ya dice cuál está elegida. */}
			{selected && (
				<span
					aria-hidden="true"
					className="grid size-7 shrink-0 place-items-center rounded-full bg-ink-950 text-white"
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
						<path d="m5 13 4 4L19 7" />
					</svg>
				</span>
			)}
		</button>
	);
}
