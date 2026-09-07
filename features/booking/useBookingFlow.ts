'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { booking } from '@/content/booking';
import { ANY_STAFF, BOOKING_PARAM } from './booking-url';
import { BookingRequestError } from '@/services/booking/request';
import { useCreateBooking } from '@/services/booking/hooks/useCreateBooking';
import { useDays } from '@/services/booking/hooks/useDays';
import { useSlots } from '@/services/booking/hooks/useSlots';
import { useStaff } from '@/services/booking/hooks/useStaff';
import type { CustomerSession } from '@/services/customer/types';
import type {
	PublicBookingConfirmation,
	PublicBusinessProfile,
	PublicService,
	PublicSlot,
	PublicStaff,
} from '@/services/booking/types';

/**
 * El flujo de reserva, con los mismos pasos que la reserva guiada de WhatsApp:
 * servicio → profesional → fecha y hora → confirmar.
 *
 * Que sean los mismos no es una coincidencia estética. Son los datos que el
 * backend necesita para reservar, en el orden en que dejan de ser ambiguos: sin
 * servicio no se sabe cuánto dura, sin duración no se sabe qué horarios entran,
 * y sin profesional no se sabe la agenda de quién mirar.
 *
 * ---
 *
 * **Lo elegido vive en la URL, no en memoria, y ésa es la decisión central.**
 *
 * Esto era un modal con `useState`, y funcionaba hasta que apareció el login:
 * iniciar sesión con Google es salir del sitio, así que al volver el estado en
 * memoria ya no existía y la persona aterrizaba en el paso uno después de haber
 * elegido servicio, profesional y horario. Con todo en la URL, volver de Google
 * es volver a la misma dirección y el flujo se reconstruye solo.
 *
 * Trae tres cosas más, gratis: el "atrás" del navegador funciona, las migas de
 * arriba son enlaces de verdad, y un paso se puede compartir por mensaje.
 *
 * **El paso no se guarda: se deriva de lo que falta.** No hay un `?paso=`, y no
 * es casual: un paso guardado aparte puede contradecir a los datos —estar en
 * "elegí hora" sin servicio— y entonces hay que decidir a cuál creerle. Si el
 * paso es una función de lo elegido, ese estado imposible no existe.
 *
 * **Dos pasos se saltean solos**: el de servicio cuando se entra tocando
 * "Reservar" en uno concreto, y el de profesional cuando hay uno solo.
 * Preguntar entre una única opción no es una elección, es un toque de más.
 */

export type BookingStep = 'service' | 'staff' | 'slot' | 'confirm' | 'done';

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

export type BookingStepChanges = Partial<
	Record<keyof typeof BOOKING_PARAM, string | null>
>;

export type BookingFlowState = {
	step: BookingStep;
	service: PublicService | null;
	/** `null` con el paso resuelto es "cualquier profesional". */
	staff: PublicStaff | null;
	staffOptions: PublicStaff[];
	days: string[];
	date: string | null;
	slots: PublicSlot[];
	slot: PublicSlot | null;
	confirmation: PublicBookingConfirmation | null;
	/**
	 * Quién está en sesión, o `null`.
	 *
	 * Llega resuelta del servidor y vive acá porque cambia mientras la pantalla
	 * está abierta: al agregar el teléfono, la misma sesión pasa de "le falta el
	 * número" a "lista para reservar" sin recargar.
	 */
	session: CustomerSession | null;
	loading: boolean;
	submitting: boolean;
	error: string | null;
};

export function useBookingFlow(
	profile: PublicBusinessProfile,
	/** La sesión tal como la resolvió el servidor al renderizar la página. */
	initialSession: CustomerSession | null,
) {
	const slug = profile.slug;
	const router = useRouter();
	const params = useSearchParams();

	const [session, setSession] = useState(initialSession);

	/* --- Lo elegido, leído de la URL --------------------------------------- */

	const serviceId = params.get(BOOKING_PARAM.service);
	const staffParam = params.get(BOOKING_PARAM.staff);
	const manualDate = params.get(BOOKING_PARAM.date);
	const slotStart = params.get(BOOKING_PARAM.slot);

	const service =
		profile.services.find((option) => option.id === serviceId) ?? null;

	/* --- Datos ------------------------------------------------------------- */

	const staffQuery = useStaff(slug, service ? service.id : null);
	const staffOptions = staffQuery.data ?? [];

	/**
	 * Con un solo profesional no se pregunta: queda elegido y el paso se saltea.
	 *
	 * Es el caso del barbero que trabaja solo, para quien un paso de "elegí
	 * profesional" con una única tarjeta sería un trámite. Se deriva de la
	 * consulta y no se escribe en la URL: escribirlo obligaría a navegar desde un
	 * efecto, y el paso llegaría a pintarse con una sola opción antes de
	 * saltearse.
	 */
	const autoResolvedStaff = staffQuery.isSuccess && staffOptions.length <= 1;

	const staffChosen = staffParam !== null;
	const staff = staffChosen
		? (staffOptions.find((option) => option.id === staffParam) ?? null)
		: autoResolvedStaff
			? (staffOptions[0] ?? null)
			: null;

	/*
	 * El profesional de la URL puede no estar en la lista: el enlace es viejo, o
	 * el negocio lo dio de baja. `cualquiera` vale siempre; un id que no existe
	 * se trata como "no eligió" y se vuelve a preguntar, que es mejor que
	 * reservar con alguien que no atiende ese servicio.
	 */
	const staffSettled =
		autoResolvedStaff ||
		staffParam === ANY_STAFF ||
		(staffChosen && staff !== null);

	const serviceParams = service
		? { serviceId: service.id, staffId: staff?.id }
		: null;

	const daysQuery = useDays(
		slug,
		service && staffSettled ? serviceParams : null,
	);
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
	const candidates = manualDate
		? [manualDate]
		: days.slice(0, AUTO_ADVANCE_LIMIT);

	const slotsQuery = useSlots(
		slug,
		service && staffSettled && serviceParams && candidates.length > 0
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

	/*
	 * `useMemo` para que la lista vacía no sea un arreglo nuevo en cada render:
	 * de eso depende que el horario elegido no se recalcule —y la función de
	 * confirmar no cambie de identidad— cada vez que algo se vuelve a dibujar.
	 */
	const slots = useMemo(
		() => slotsQuery.data?.slots ?? [],
		[slotsQuery.data?.slots],
	);

	/*
	 * El horario de la URL se toma tal cual y no se exige encontrarlo en `slots`:
	 * la lista puede estar viajando, o el horario puede haberse ocupado mientras
	 * la persona iniciaba sesión. En los dos casos hay que llegar a "confirmar" y
	 * dejar que el backend revalide —perder lo elegido por un refresco de la
	 * lista sería peor que un 409 con su mensaje—.
	 */
	const slot: PublicSlot | null = useMemo(
		() =>
			slotStart
				? (slots.find((option) => option.startTime === slotStart) ?? {
						startTime: slotStart,
						endTime: slotStart,
					})
				: null,
		[slotStart, slots],
	);

	const create = useCreateBooking(slug);

	/* --- El paso, derivado ------------------------------------------------- */

	const step: BookingStep = create.data
		? 'done'
		: !service
			? 'service'
			: !staffSettled
				? 'staff'
				: !slot
					? 'slot'
					: 'confirm';

	/* --- Navegación: escribir en la URL ------------------------------------ */

	/**
	 * Avanzar es navegar. `push` y no `replace`: cada paso es una entrada del
	 * historial, y por eso el "atrás" del navegador y el gesto de volver del
	 * teléfono hacen lo que la gente espera sin programar nada.
	 *
	 * `scroll: false` porque el alto no cambia entre pasos y un salto al tope en
	 * cada toque se siente como una recarga.
	 */
	const navigate = useCallback(
		(changes: BookingStepChanges) => {
			const next = new URLSearchParams(params.toString());

			for (const [key, value] of Object.entries(changes)) {
				const name = BOOKING_PARAM[key as keyof typeof BOOKING_PARAM];
				if (value === null) next.delete(name);
				else next.set(name, value);
			}

			create.reset();
			router.push(`?${next.toString()}`, { scroll: false });
		},
		[create, params, router],
	);

	/*
	 * Elegir algo borra lo que venía después. No es prolijidad: el horario de las
	 * tres existía para el servicio de media hora con Fernando, y quien cambia de
	 * servicio o de profesional está preguntando otra cosa. Sin este borrado, la
	 * URL quedaría con un horario que la combinación nueva quizá no ofrece.
	 */
	const selectService = useCallback(
		(next: PublicService) =>
			navigate({ service: next.id, staff: null, date: null, slot: null }),
		[navigate],
	);

	const selectStaff = useCallback(
		(next: PublicStaff | null) =>
			navigate({ staff: next?.id ?? ANY_STAFF, date: null, slot: null }),
		[navigate],
	);

	const selectDate = useCallback(
		(next: string) => navigate({ date: next, slot: null }),
		[navigate],
	);

	const selectSlot = useCallback(
		(next: PublicSlot) => navigate({ slot: next.startTime }),
		[navigate],
	);

	/**
	 * La sesión cambió sin recargar: se acaba de guardar el teléfono.
	 *
	 * Es lo que permite que el paso siguiente sea confirmar y no volver a pedir
	 * el número. La fuente sigue siendo el servidor; esto sólo adelanta lo que la
	 * próxima carga va a decir igual.
	 */
	const updateSession = useCallback(
		(next: CustomerSession) => setSession(next),
		[],
	);

	/**
	 * Confirma la reserva. No lleva datos de quien reserva: los toma la API de la
	 * sesión, que es la única fuente que no se puede falsear desde el navegador.
	 */
	const confirm = useCallback(() => {
		if (!service || !slot) return;

		create.mutate({
			serviceId: service.id,
			staffId: staff?.id,
			startTime: slot.startTime,
		});
	}, [create, service, slot, staff]);

	/* --- Lo que ve la pantalla --------------------------------------------- */

	const loading =
		step === 'staff'
			? staffQuery.isLoading
			: step === 'slot'
				? daysQuery.isLoading || slotsQuery.isLoading
				: false;

	const stepError =
		step === 'staff'
			? staffQuery.error
			: step === 'slot'
				? (daysQuery.error ?? slotsQuery.error)
				: null;

	return {
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
			session,
			loading,
			submitting: create.isPending,
			error: messageOf(create.error) ?? messageOf(stepError),
		} satisfies BookingFlowState,
		selectService,
		selectStaff,
		selectDate,
		selectSlot,
		updateSession,
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
