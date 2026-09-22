'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { booking } from '@/content/booking';
import {
	ANY_STAFF,
	BOOKING_PARAM,
	PER_SERVICE_STAFF,
	PICKING_SERVICES,
	PICKING_STAFF,
	readIds,
} from './booking-url';
import { BookingRequestError } from '@/services/booking/request';
import { useCreateBooking } from '@/services/booking/hooks/useCreateBooking';
import { useDays } from '@/services/booking/hooks/useDays';
import { useSlots } from '@/services/booking/hooks/useSlots';
import { useStaff } from '@/services/booking/hooks/useStaff';
import {
	MAX_SERVICES_PER_BOOKING,
	type BookingSelection,
} from '@/services/booking/selection';
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
 * servicios → profesional → fecha y hora → confirmar.
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
 * **Un paso se saltea solo**: el de profesional, cuando hay uno solo capaz de
 * hacer todo lo elegido. Preguntar entre una única opción no es una elección,
 * es un toque de más.
 *
 * ---
 *
 * **Una reserva lleva uno o varios servicios**, encadenados en el orden en que
 * se eligieron. Eso cambió dos cosas de este hook, y conviene tenerlas claras:
 *
 * - Elegir un servicio dejó de avanzar. Se marcan los que se quieran y se pasa
 *   con "Continuar", así que hace falta saber si la lista sigue abierta: eso es
 *   `BOOKING_PARAM.picking`, el único estado de pantalla que hay acá.
 * - El profesional puede ser uno para toda la reserva o uno por servicio, y las
 *   dos formas viven en el mismo parámetro. Ver `readStaffChoice`.
 */

export type BookingStep =
	| 'service'
	| 'staff'
	| 'staffPerService'
	| 'slot'
	| 'confirm'
	| 'done';

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

/**
 * Cómo quedó resuelto "quién atiende".
 *
 * Los cuatro casos son los cuatro que la URL puede escribir, enumerados acá para
 * que la pantalla no tenga que adivinarlos leyendo el parámetro:
 *
 * - `pending`: no eligió. Es el paso de profesional.
 * - `any`: le da igual. El servidor resuelve **uno solo** para toda la reserva.
 * - `shared`: eligió a una persona para todo.
 * - `perService`: una por servicio. Mientras falte alguna, el paso es el de
 *   repartir.
 */
export type StaffChoice =
	| { kind: 'pending' }
	| { kind: 'any' }
	| { kind: 'shared'; staffId: string }
	| { kind: 'perService'; staffIds: (string | null)[] };

export type BookingFlowState = {
	step: BookingStep;
	/** Los servicios elegidos, en orden de atención. Vacío en el primer paso. */
	services: PublicService[];
	/** La suma de las duraciones: lo que va a durar estar ahí. */
	durationMinutes: number;
	/**
	 * La suma de los precios, o `null` si alguno se cotiza.
	 *
	 * `null` y no la suma de los que sí tienen importe: un total que ignora al
	 * servicio que se cotiza es un número que el cliente va a leer como lo que
	 * paga, y no lo es.
	 */
	totalPrice: number | null;
	staffChoice: StaffChoice;
	/** Quiénes pueden con **toda** la reserva. Vacío si nadie puede solo. */
	staffOptions: PublicStaff[];
	/** Quiénes pueden con cada servicio, en el orden de `services`. */
	staffByService: { serviceId: string; staff: PublicStaff[] }[];
	/** El profesional elegido para todo, cuando hay uno. */
	staff: PublicStaff | null;
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

	const serviceParam = params.get(BOOKING_PARAM.services);
	const staffParam = params.get(BOOKING_PARAM.staff);
	const picking = params.get(BOOKING_PARAM.picking);
	const pickingServices = picking === PICKING_SERVICES;
	const pickingStaff = picking === PICKING_STAFF;
	const manualDate = params.get(BOOKING_PARAM.date);
	const slotStart = params.get(BOOKING_PARAM.slot);

	/*
	 * Los servicios se resuelven **en el orden de la URL** y no en el del
	 * catálogo: ese orden es el que el cliente vio en el resumen y el que el
	 * backend va a encadenar. Un id que ya no existe —enlace viejo, servicio dado
	 * de baja— se cae de la lista en lugar de romper la pantalla.
	 */
	const services = useMemo(() => {
		const byId = new Map(profile.services.map((item) => [item.id, item]));

		return readIds(serviceParam)
			.map((id) => byId.get(id))
			.filter((item): item is PublicService => Boolean(item));
	}, [profile.services, serviceParam]);

	const serviceIds = useMemo(
		() => services.map((service) => service.id),
		[services],
	);

	/* --- Datos ------------------------------------------------------------- */

	const staffQuery = useStaff(slug, serviceIds.length > 0 ? serviceIds : null);

	const staffOptions = useMemo(
		() => staffQuery.data?.shared ?? [],
		[staffQuery.data?.shared],
	);

	const staffByService = useMemo(
		() => staffQuery.data?.byService ?? [],
		[staffQuery.data?.byService],
	);

	/**
	 * Con un solo profesional posible no se pregunta: queda elegido y el paso se
	 * saltea.
	 *
	 * Es el caso del barbero que trabaja solo, para quien un paso de "elegí
	 * profesional" con una única tarjeta sería un trámite. Se deriva de la
	 * consulta y no se escribe en la URL: escribirlo obligaría a navegar desde un
	 * efecto, y el paso llegaría a pintarse con una sola opción antes de
	 * saltearse.
	 */
	const onlyStaff =
		staffQuery.isSuccess && staffOptions.length === 1 ? staffOptions[0] : null;

	const staffChoice = useMemo(
		() =>
			readStaffChoice({
				raw: staffParam,
				serviceCount: services.length,
				staffOptions,
				staffByService,
				onlyStaff,
			}),
		[staffParam, services.length, staffOptions, staffByService, onlyStaff],
	);

	/**
	 * Lo que se le pregunta al backend: los servicios y, si ya se sabe, con quién
	 * cada uno.
	 *
	 * `null` mientras falte decidir quién atiende, y por eso apaga las consultas
	 * de días y horarios: preguntar horarios antes de saber de quién es la agenda
	 * devolvería una lista que el paso siguiente contradice.
	 */
	const selection: BookingSelection | null = useMemo(
		() => toSelection(serviceIds, staffChoice),
		[serviceIds, staffChoice],
	);

	const daysQuery = useDays(slug, selection);
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
		selection && candidates.length > 0 ? { ...selection, candidates } : null,
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

	const repartiendo =
		staffChoice.kind === 'perService' && (pickingStaff || !selection);

	const step: BookingStep = create.data
		? 'done'
		: services.length === 0 || pickingServices
			? 'service'
			: staffChoice.kind === 'pending'
				? 'staff'
				: repartiendo
					? 'staffPerService'
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
	 *
	 * `replace` es para lo que pasa **dentro** de un paso: marcar y desmarcar
	 * servicios, o asignar profesionales de a uno. Ahí cada toque no es un paso, y
	 * con `push` volver atrás desde el paso siguiente obligaría a deshacer toque
	 * por toque antes de salir de la lista.
	 */
	const navigate = useCallback(
		(changes: BookingStepChanges, mode: 'push' | 'replace' = 'push') => {
			const next = new URLSearchParams(params.toString());

			for (const [key, value] of Object.entries(changes)) {
				const name = BOOKING_PARAM[key as keyof typeof BOOKING_PARAM];
				if (value === null) next.delete(name);
				else next.set(name, value);
			}

			create.reset();
			const href = `?${next.toString()}`;

			if (mode === 'replace') router.replace(href, { scroll: false });
			else router.push(href, { scroll: false });
		},
		[create, params, router],
	);

	/*
	 * Marcar o desmarcar un servicio borra lo que venía después. No es prolijidad:
	 * el horario de las tres existía para media hora de corte con Fernando, y
	 * quien agrega la barba está preguntando otra cosa —ahora es una hora—. Sin
	 * este borrado, la URL quedaría con un horario que la combinación nueva quizá
	 * no ofrece.
	 *
	 * El que se agrega va **al final**: ése es el orden en que se van a atender, y
	 * el que el cliente acaba de expresar.
	 */
	const toggleService = useCallback(
		(next: PublicService) => {
			const removing = serviceIds.includes(next.id);

			/*
			 * El tope lo pone la API, y acá se respeta en vez de dejar que el sexto
			 * servicio se marque y muera en un 400 al pedir horarios. La lista apaga
			 * lo que no se puede marcar, así que esto es la red y no el mecanismo.
			 * Ver `MAX_SERVICES_PER_BOOKING`.
			 */
			if (!removing && serviceIds.length >= MAX_SERVICES_PER_BOOKING) return;

			const chosen = removing
				? serviceIds.filter((id) => id !== next.id)
				: [...serviceIds, next.id];

			navigate(
				{
					services: chosen.length > 0 ? chosen.join(',') : null,
					// La lista sigue abierta: marcar no es haber terminado de elegir.
					picking: PICKING_SERVICES,
					staff: null,
					date: null,
					slot: null,
				},
				'replace',
			);
		},
		[navigate, serviceIds],
	);

	/**
	 * "Continuar": cierra la lista abierta —servicios o profesionales— y deja que
	 * el paso vuelva a derivarse de lo elegido.
	 *
	 * Uno solo para los dos pasos porque hace exactamente lo mismo: apagar el
	 * rastro. Qué viene después no lo decide este botón sino lo que haya elegido.
	 */
	const confirmPicking = useCallback(
		() => navigate({ picking: null }),
		[navigate],
	);

	/** Volver a abrir la lista, para agregar o sacar servicios. */
	const editServices = useCallback(
		() => navigate({ picking: PICKING_SERVICES }),
		[navigate],
	);

	/**
	 * Un profesional para toda la reserva, o "cualquiera" con `null`.
	 *
	 * Apaga `eligiendo` de paso: elegir a una persona para todo es la respuesta
	 * contraria a repartir, y dejar el rastro encendido devolvería al paso de
	 * repartir en el render siguiente.
	 */
	const selectStaff = useCallback(
		(next: PublicStaff | null) =>
			navigate({
				staff: next?.id ?? ANY_STAFF,
				picking: null,
				date: null,
				slot: null,
			}),
		[navigate],
	);

	/** "Elegir profesional por servicio": abre el paso de repartir. */
	const selectStaffPerService = useCallback(
		() =>
			navigate({
				staff: PER_SERVICE_STAFF,
				picking: PICKING_STAFF,
				date: null,
				slot: null,
			}),
		[navigate],
	);

	/**
	 * Asigna el profesional de **un** servicio, dejando los demás como estaban.
	 *
	 * Va con `replace` porque asignar de a uno es completar el mismo paso y no
	 * avanzar: con `push`, volver atrás desde "elegí hora" iría deshaciendo
	 * asignaciones una por una.
	 *
	 * Mientras falte alguno, el parámetro vuelve al centinela: una lista a medio
	 * llenar no es una elección, y escribirla como lista dejaría al flujo creyendo
	 * que ya está resuelto.
	 */
	const assignStaff = useCallback(
		(index: number, staffId: string) => {
			const current =
				staffChoice.kind === 'perService'
					? staffChoice.staffIds
					: serviceIds.map(() => null);

			const next = serviceIds.map((_, position) =>
				position === index ? staffId : (current[position] ?? ''),
			);

			navigate(
				{
					staff: next.every(Boolean) ? next.join(',') : PER_SERVICE_STAFF,
					// La pantalla sigue abierta hasta que se apriete "Continuar":
					// asignar el último no puede navegar debajo del dedo de alguien que
					// todavía está revisando el primero.
					picking: PICKING_STAFF,
					date: null,
					slot: null,
				},
				'replace',
			);
		},
		[navigate, serviceIds, staffChoice],
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
	 * Confirma la reserva.
	 *
	 * Con sesión no lleva datos de quien reserva: los toma la API de la cuenta,
	 * que es la única fuente que no se puede falsear desde el navegador. Sin
	 * sesión llegan escritos, y es el camino que evita perder a alguien que nunca
	 * quiso una cuenta —o que no pudo entrar porque Google falló—.
	 *
	 * Los campos se omiten y no se mandan vacíos cuando hay cuenta: `@IsOptional`
	 * del backend deja pasar lo ausente, no lo vacío.
	 */
	const confirm = useCallback(
		(identity?: { name: string; phone: string }) => {
			if (!selection || !slot) return;

			create.mutate({
				...selection,
				startTime: slot.startTime,
				...(identity
					? {
							customerName: identity.name.trim(),
							customerPhone: identity.phone.trim(),
						}
					: {}),
			});
		},
		[create, selection, slot],
	);

	/* --- Lo que ve la pantalla --------------------------------------------- */

	const choosingStaff = step === 'staff' || step === 'staffPerService';

	const loading = choosingStaff
		? staffQuery.isLoading
		: step === 'slot'
			? daysQuery.isLoading || slotsQuery.isLoading
			: false;

	const stepError = choosingStaff
		? staffQuery.error
		: step === 'slot'
			? (daysQuery.error ?? slotsQuery.error)
			: null;

	const staff =
		staffChoice.kind === 'shared'
			? (staffOptions.find((member) => member.id === staffChoice.staffId) ??
				null)
			: null;

	return {
		state: {
			step,
			services,
			durationMinutes: services.reduce(
				(total, service) => total + service.durationMinutes,
				0,
			),
			totalPrice: services.some((service) => service.price === null)
				? null
				: services.reduce((total, service) => total + (service.price ?? 0), 0),
			staffChoice,
			staffOptions,
			staffByService,
			staff,
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
		toggleService,
		confirmPicking,
		editServices,
		selectStaff,
		selectStaffPerService,
		assignStaff,
		selectDate,
		selectSlot,
		updateSession,
		confirm,
	};
}

/**
 * Qué dice el parámetro `profesionales`.
 *
 * Un solo parámetro para las tres formas de contestar "quién atiende", y no tres
 * parámetros distintos: son excluyentes entre sí, y con uno cada uno existirían
 * combinaciones —"cualquiera" y además una lista— a las que habría que decidir
 * cuál creerle.
 *
 * **Un id que no está entre las opciones se trata como "no eligió"**, igual que
 * antes: el enlace puede ser viejo, o el negocio pudo dar de baja al profesional.
 * Volver a preguntar es mejor que reservar con alguien que no atiende eso.
 */
function readStaffChoice(input: {
	raw: string | null;
	serviceCount: number;
	staffOptions: PublicStaff[];
	staffByService: { serviceId: string; staff: PublicStaff[] }[];
	onlyStaff: PublicStaff | null;
}): StaffChoice {
	const { raw, serviceCount, staffOptions, staffByService, onlyStaff } = input;

	if (raw === ANY_STAFF) return { kind: 'any' };

	if (raw === PER_SERVICE_STAFF) {
		return { kind: 'perService', staffIds: Array(serviceCount).fill(null) };
	}

	const ids = readIds(raw);

	if (ids.length === 1) {
		return staffOptions.some((member) => member.id === ids[0])
			? { kind: 'shared', staffId: ids[0] }
			: { kind: 'pending' };
	}

	if (serviceCount > 1 && ids.length === serviceCount) {
		const valid = ids.every((id, index) =>
			(staffByService[index]?.staff ?? []).some((member) => member.id === id),
		);

		return valid ? { kind: 'perService', staffIds: ids } : { kind: 'pending' };
	}

	/*
	 * Nadie eligió, pero puede que no haya nada que elegir: con un solo
	 * profesional capaz de hacer todo, queda elegido él.
	 */
	if (onlyStaff) return { kind: 'shared', staffId: onlyStaff.id };

	return { kind: 'pending' };
}

/**
 * La selección lista para consultar, o `null` si todavía falta decidir.
 *
 * `any` viaja **sin** `staffIds` a propósito: es lo que le dice al backend que
 * resuelva uno solo para toda la reserva. Llenar la lista de centinelas sería
 * escribir la misma intención de otra forma, y dos formas de decir lo mismo son
 * dos ramas que pueden discrepar.
 */
function toSelection(
	serviceIds: string[],
	choice: StaffChoice,
): BookingSelection | null {
	if (serviceIds.length === 0) return null;

	switch (choice.kind) {
		case 'any':
			return { serviceIds };

		case 'shared':
			return { serviceIds, staffIds: serviceIds.map(() => choice.staffId) };

		case 'perService': {
			const staffIds = choice.staffIds;

			return staffIds.every((id): id is string => Boolean(id))
				? { serviceIds, staffIds }
				: null;
		}

		case 'pending':
			return null;
	}
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
