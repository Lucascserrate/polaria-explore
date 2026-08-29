'use client';

import { useCallback, useState } from 'react';
import { booking } from '@/content/booking';
import { BookingRequestError } from '@/services/booking/request';
import { useCreateBooking } from '@/services/booking/hooks/useCreateBooking';
import { useDays } from '@/services/booking/hooks/useDays';
import { useSlots } from '@/services/booking/hooks/useSlots';
import { useStaff } from '@/services/booking/hooks/useStaff';
import type {
	PublicBookingConfirmation,
	PublicBusinessProfile,
	PublicService,
	PublicSlot,
	PublicStaff,
} from '@/services/booking/types';

/**
 * El flujo de reserva, con los mismos pasos que la reserva guiada de WhatsApp:
 * servicio → profesional → fecha y hora → datos → listo.
 *
 * Que sean los mismos no es una coincidencia estética. Son los datos que el
 * backend necesita para reservar, en el orden en que dejan de ser ambiguos: sin
 * servicio no se sabe cuánto dura, sin duración no se sabe qué horarios entran,
 * y sin profesional no se sabe la agenda de quién mirar.
 *
 * **Dos pasos se saltean solos**, y ésa es la diferencia entre un formulario y
 * un flujo: el de servicio cuando se entra tocando "Reservar" en uno concreto,
 * y el de profesional cuando hay uno solo. Preguntar entre una única opción no
 * es una elección, es un toque de más.
 *
 * El hook no sabe nada de disponibilidad: pide y muestra. Qué horario existe lo
 * decide el backend, y el que se elige se revalida al confirmar.
 *
 * ---
 *
 * **Qué cambió al pasar a React Query.** Antes este archivo llevaba a mano un
 * `AbortController`, un `loading`, un `error` y las listas ya pedidas. Ahora
 * cada dato es una consulta de `services/booking/hooks/`, y lo que queda acá es
 * lo único que React Query no puede saber: en qué paso está la persona, qué
 * eligió y a dónde vuelve.
 *
 * De ahí salen dos consecuencias que valen la pena:
 *
 * 1. **La carrera desapareció en lugar de resolverse.** El riesgo era que la
 *    respuesta del primer día pisara la del tercero cuando alguien toca tres
 *    días seguidos. Con una clave por consulta eso no puede pasar: la pantalla
 *    lee la entrada del día que está marcado, y las demás se cancelan solas.
 * 2. **Casi todo el estado se deriva.** `days`, `slots`, `loading` y `error`
 *    salen de las consultas; no hay un `setState` que pueda quedar desfasado de
 *    lo que se está pidiendo.
 */

export type BookingStep = 'service' | 'staff' | 'slot' | 'details' | 'done';

/** Cuántos días ofrece el selector. Cuatro semanas alcanzan para una barbería. */
const DAYS_AHEAD = 28;

/**
 * Cuántos días se prueban buscando el primero con cupo.
 *
 * Cada uno es una consulta, así que el tope existe para que abrir la reserva en
 * un negocio sin turnos en semanas no dispare veintiocho. Con tres, un negocio
 * lleno hoy y mañana igual abre en un día útil; más allá de eso, mostrar el
 * primer día vacío y dejar elegir a mano es más honesto que seguir buscando.
 */
const AUTO_ADVANCE_LIMIT = 3;

export type BookingFlowState = {
	step: BookingStep;
	service: PublicService | null;
	/** `null` estando el paso resuelto es "cualquier profesional". */
	staff: PublicStaff | null;
	staffOptions: PublicStaff[];
	days: string[];
	date: string | null;
	slots: PublicSlot[];
	slot: PublicSlot | null;
	confirmation: PublicBookingConfirmation | null;
	/**
	 * Lo que el cliente escribió de sí mismo.
	 *
	 * Vive en el flujo y no dentro del paso de datos porque el paso se desmonta:
	 * cuando el horario se ocupa mientras alguien termina de escribir su nombre,
	 * se lo manda de vuelta a elegir otro, y volver a pedirle el nombre y el
	 * teléfono sería castigarlo por una carrera que perdió sin enterarse.
	 */
	customer: { name: string; phone: string };
	loading: boolean;
	submitting: boolean;
	error: string | null;
	/** Hay a dónde volver, o el paso actual es el primero que se mostró. */
	canGoBack: boolean;
};

export function useBookingFlow(profile: PublicBusinessProfile) {
	const slug = profile.slug;

	const [open, setOpen] = useState(false);
	const [history, setHistory] = useState<BookingStep[]>([]);
	const [rawStep, setRawStep] = useState<BookingStep>('service');
	const [service, setService] = useState<PublicService | null>(null);
	const [slot, setSlot] = useState<PublicSlot | null>(null);
	const [customer, setCustomer] = useState({ name: '', phone: '' });

	/**
	 * La elección de profesional, separada en dos.
	 *
	 * `chosen` existe porque `null` es una respuesta válida —"cualquiera"— y no
	 * se puede distinguir de "todavía no eligió" mirando sólo el valor.
	 */
	const [staffChoice, setStaffChoice] = useState<{
		chosen: boolean;
		value: PublicStaff | null;
	}>({ chosen: false, value: null });

	/** El día que el cliente tocó. `null` = el flujo elige por él. */
	const [manualDate, setManualDate] = useState<string | null>(null);

	/* --- Datos ------------------------------------------------------------- */

	const staffQuery = useStaff(slug, open && service ? service.id : null);
	const staffOptions = staffQuery.data ?? [];

	/**
	 * Con un solo profesional no se pregunta: queda elegido y el paso se saltea.
	 *
	 * Es el caso del barbero que trabaja solo, para quien un paso de "elegí
	 * profesional" con una única tarjeta sería un trámite. Se deriva de la
	 * consulta en lugar de navegar desde un efecto: así el paso nunca llega a
	 * pintarse con una sola opción y no queda un "Volver" que lleva a una
	 * pregunta sin respuestas posibles.
	 */
	const autoResolvedStaff = staffQuery.isSuccess && staffOptions.length <= 1;
	const staff = staffChoice.chosen
		? staffChoice.value
		: (autoResolvedStaff ? (staffOptions[0] ?? null) : null);
	const staffSettled = staffChoice.chosen || autoResolvedStaff;

	const step: BookingStep =
		rawStep === 'staff' && autoResolvedStaff ? 'slot' : rawStep;

	const onSlotStep = open && step === 'slot' && service !== null && staffSettled;
	const serviceParams = service
		? { serviceId: service.id, staffId: staff?.id }
		: null;

	const daysQuery = useDays(slug, onSlotStep ? serviceParams : null);
	const days = (daysQuery.data ?? []).slice(0, DAYS_AHEAD);

	/**
	 * Qué días se preguntan.
	 *
	 * Uno solo si el cliente tocó un día: si está completo, la respuesta correcta
	 * es decírselo, no saltar a otro por su cuenta. Si no eligió, los primeros de
	 * la lista, porque `days` trae los días con atención y no los que tienen cupo
	 * — sin esto, abrir la reserva en un negocio lleno empieza con un "no quedan
	 * horarios" aunque haya turnos pasado mañana.
	 */
	const candidates = manualDate ? [manualDate] : days.slice(0, AUTO_ADVANCE_LIMIT);

	const slotsQuery = useSlots(
		slug,
		onSlotStep && serviceParams && candidates.length > 0
			? { ...serviceParams, candidates }
			: null,
	);

	/*
	 * El día marcado mientras la consulta viaja es el que el cliente tocó; cuando
	 * contesta, el que resolvió el servidor. Nunca se mezclan: `slots` sale de la
	 * misma respuesta que `date`, así que no existe el estado "esta fecha con los
	 * horarios de otra".
	 */
	const date = slotsQuery.data?.date ?? manualDate ?? days[0] ?? null;
	const slots = slotsQuery.data?.slots ?? [];

	const create = useCreateBooking(slug);

	/* --- Navegación -------------------------------------------------------- */

	const goTo = useCallback(
		(next: BookingStep) => {
			create.reset();
			setHistory((current) => [...current, next]);
			setRawStep(next);
		},
		[create],
	);

	const start = useCallback(
		(from?: PublicService) => {
			create.reset();
			setSlot(null);
			setCustomer({ name: '', phone: '' });
			setManualDate(null);
			setStaffChoice({ chosen: false, value: null });
			setOpen(true);

			// Entrando por "Reservar" de un servicio concreto, ese paso ya está
			// contestado y el historial arranca en el de profesional: no hay a dónde
			// volver.
			setService(from ?? null);
			setHistory([from ? 'staff' : 'service']);
			setRawStep(from ? 'staff' : 'service');
		},
		[create],
	);

	const close = useCallback(() => setOpen(false), []);

	const back = useCallback(() => {
		// El primer paso mostrado no tiene atrás: ahí "Volver" es cerrar.
		if (history.length <= 1) {
			setOpen(false);
			return;
		}

		create.reset();
		setSlot(null);
		setHistory((current) => {
			const next = current.slice(0, -1);
			setRawStep(next[next.length - 1]);
			return next;
		});
	}, [create, history.length]);

	/* --- Elecciones -------------------------------------------------------- */

	const selectService = useCallback(
		(next: PublicService) => {
			setService(next);
			setStaffChoice({ chosen: false, value: null });
			setManualDate(null);
			setSlot(null);
			goTo('staff');
		},
		[goTo],
	);

	const selectStaff = useCallback(
		(next: PublicStaff | null) => {
			setStaffChoice({ chosen: true, value: next });
			setManualDate(null);
			setSlot(null);
			goTo('slot');
		},
		[goTo],
	);

	const selectDate = useCallback((next: string) => {
		setManualDate(next);
		setSlot(null);
	}, []);

	const selectSlot = useCallback(
		(next: PublicSlot) => {
			setSlot(next);
			goTo('details');
		},
		[goTo],
	);

	const updateCustomer = useCallback(
		(next: { name: string; phone: string }) => setCustomer(next),
		[],
	);

	const confirm = useCallback(
		async (next: { name: string; phone: string }) => {
			if (!service || !slot) return;

			setCustomer(next);

			create.mutate(
				{
					serviceId: service.id,
					staffId: staff?.id,
					startTime: slot.startTime,
					customerName: next.name,
					customerPhone: next.phone,
				},
				{
					onSuccess: () => {
						setHistory((current) => [...current, 'done']);
						setRawStep('done');
					},
					onError: (error) => {
						/*
						 * Perder el horario no es un error del formulario: entre que se
						 * mostró la lista y el cliente terminó de escribir su nombre, otro
						 * lo tomó. Se lo devuelve al paso de horarios —sin el paso de datos
						 * en el historial, para que "Volver" no lo traiga de nuevo acá— y
						 * la lista se recarga sola, porque la mutación invalida los
						 * horarios del negocio pase lo que pase.
						 */
						if (error instanceof BookingRequestError && error.isSlotTaken) {
							setSlot(null);
							setHistory((current) => current.filter((s) => s !== 'details'));
							setRawStep('slot');
						}
					},
				},
			);
		},
		[create, service, slot, staff],
	);

	/* --- Lo que ve la pantalla --------------------------------------------- */

	const loading =
		step === 'staff'
			? staffQuery.isLoading
			: step === 'slot'
				? daysQuery.isLoading || slotsQuery.isLoading
				: false;

	/*
	 * El error del paso en el que está la persona, y sólo ése. Uno de un paso que
	 * ya quedó atrás no tiene nada que decirle a la pantalla que está mirando.
	 */
	const stepError =
		step === 'staff'
			? staffQuery.error
			: step === 'slot'
				? (daysQuery.error ?? slotsQuery.error)
				: null;

	return {
		open,
		state: {
			step,
			service,
			staff,
			staffOptions,
			days,
			date,
			slots,
			slot,
			confirmation: create.data ?? null,
			customer,
			loading,
			submitting: create.isPending,
			error: messageOf(create.error) ?? messageOf(stepError),
			canGoBack: history.length > 1,
		} satisfies BookingFlowState,
		start,
		close,
		back,
		selectService,
		selectStaff,
		selectDate,
		selectSlot,
		updateCustomer,
		confirm,
	};
}

/**
 * El texto que se muestra.
 *
 * El 409 se traduce acá y no en el `onError`: el mensaje que manda la API
 * describe el conflicto, pero lo que el cliente necesita leer es qué hacer
 * ahora, que es elegir otro horario de la lista que se acaba de recargar.
 */
function messageOf(error: unknown): string | null {
	if (!error) return null;

	if (error instanceof BookingRequestError) {
		return error.isSlotTaken ? booking.flow.errors.slotTaken : error.message;
	}

	return booking.flow.errors.generic;
}
