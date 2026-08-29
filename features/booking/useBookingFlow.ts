"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { booking } from "@/content/booking";
import {
  BookingRequestError,
  fetchDays,
  fetchSlots,
  fetchStaff,
  submitBooking,
} from "./client";
import type {
  PublicBookingConfirmation,
  PublicBusinessProfile,
  PublicService,
  PublicSlot,
  PublicStaff,
} from "./types";

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
 */

export type BookingStep = "service" | "staff" | "slot" | "details" | "done";

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
  /** `null` con `staffResolved` en true es "cualquier profesional". */
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
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<BookingStep[]>([]);
  const [state, setState] = useState<BookingFlowState>(initialState);

  /**
   * Cancela lo que quedó pidiéndose al cambiar de paso o de fecha.
   *
   * Sin esto, tocar tres días seguidos deja tres consultas en vuelo y gana la
   * que conteste última, que puede ser la del primer día: la lista mostraría
   * horarios de una fecha distinta de la marcada.
   */
  const pending = useRef<AbortController | null>(null);

  const run = useCallback(
    async <T,>(
      task: (signal: AbortSignal) => Promise<T>,
      onDone: (value: T) => void,
    ) => {
      pending.current?.abort();
      const controller = new AbortController();
      pending.current = controller;

      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const value = await task(controller.signal);
        if (controller.signal.aborted) return;
        onDone(value);
      } catch (error) {
        if (controller.signal.aborted || isAbort(error)) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: messageOf(error),
        }));
      } finally {
        if (pending.current === controller) {
          pending.current = null;
          setState((current) => ({ ...current, loading: false }));
        }
      }
    },
    [],
  );

  useEffect(() => () => pending.current?.abort(), []);

  const goTo = useCallback((step: BookingStep) => {
    setHistory((current) => [...current, step]);
    setState((current) => ({ ...current, step, error: null }));
  }, []);

  /**
   * Cambia el paso actual sin dejar rastro en el historial.
   *
   * Lo usa el salteo del profesional: el paso ya estaba en pantalla —cargando—
   * cuando se descubre que hay uno solo, y apilarlo dejaría un "Volver" que
   * lleva a una pregunta sin respuestas posibles.
   */
  const replaceWith = useCallback((step: BookingStep) => {
    setHistory((current) => [...current.slice(0, -1), step]);
    setState((current) => ({ ...current, step, error: null }));
  }, []);

  /**
   * Carga los horarios del primer día de `candidates` que tenga alguno, y lo
   * deja marcado.
   *
   * La fecha y su lista se escriben juntas, en un solo `setState` y recién al
   * final: una fecha marcada con los horarios de otra es un estado que no
   * significa nada, y hacerlo por partes lo volvería posible.
   *
   * **Por qué recorre varios días.** El backend descarta los días que el
   * negocio no atiende, pero no mira la agenda: un lunes con todo tomado sigue
   * siendo un día "con atención". Sin esto, abrir la reserva en una barbería
   * llena empieza con un "no quedan horarios", que es la peor primera pantalla
   * posible cuando sí hay turnos el martes. Cuando el cliente toca un día
   * concreto, en cambio, `candidates` trae uno solo: ahí decir que ese día está
   * completo es la respuesta correcta, no un problema que haya que esquivar.
   */
  const loadSlotsFrom = useCallback(
    (
      service: PublicService,
      staff: PublicStaff | null,
      candidates: string[],
    ) => {
      if (candidates.length === 0) return;

      setState((current) => ({
        ...current,
        date: candidates[0],
        slots: [],
        slot: null,
      }));

      void run(
        async (signal) => {
          const probed = candidates.slice(0, AUTO_ADVANCE_LIMIT);

          for (const date of probed) {
            const slots = await fetchSlots(
              profile.slug,
              { serviceId: service.id, date, staffId: staff?.id },
              signal,
            );
            if (slots.length > 0) return { date, slots };
          }

          // Ninguno tenía cupo: se muestra el primero vacío, que es el que el
          // cliente esperaba ver.
          return { date: candidates[0], slots: [] };
        },
        ({ date, slots }) =>
          setState((current) => ({ ...current, date, slots })),
      );
    },
    [profile.slug, run],
  );

  /**
   * Abre el paso de horarios: pide los días con atención y arranca en el
   * primero que tenga cupo. Que el selector nazca en un día que sirve es lo que
   * evita que el primer contacto con la reserva sea un "no quedan horarios".
   */
  const openSlotStep = useCallback(
    (service: PublicService, staff: PublicStaff | null, replace = false) => {
      if (replace) replaceWith("slot");
      else goTo("slot");
      setState((current) => ({ ...current, days: [], slots: [], slot: null }));

      void run(
        (signal) =>
          fetchDays(
            profile.slug,
            { serviceId: service.id, staffId: staff?.id },
            signal,
          ),
        (all) => {
          const days = all.slice(0, DAYS_AHEAD);
          setState((current) => ({ ...current, days }));
          loadSlotsFrom(service, staff, days);
        },
      );
    },
    [goTo, loadSlotsFrom, profile.slug, replaceWith, run],
  );

  const selectStaff = useCallback(
    (staff: PublicStaff | null) => {
      setState((current) => ({ ...current, staff }));
      if (state.service) openSlotStep(state.service, staff);
    },
    [openSlotStep, state.service],
  );

  /**
   * Elige el servicio y decide el paso siguiente según cuánta gente lo hace.
   *
   * Con un solo profesional no se pregunta y queda elegido: es el caso del
   * barbero que trabaja solo, para quien un paso de "elegí profesional" con una
   * única tarjeta sería un trámite.
   */
  const selectService = useCallback(
    (service: PublicService) => {
      setState((current) => ({
        ...current,
        service,
        staff: null,
        staffOptions: [],
      }));

      /*
       * Se entra al paso de profesional **antes** de saber cuántos hay, y si
       * resulta haber uno solo se reemplaza por el de horarios. Al revés
       * —esperar la respuesta y recién entonces navegar— la pantalla se queda
       * en lo anterior sin decir nada, que es justo cuando el cliente cree que
       * el botón no funcionó y lo vuelve a tocar.
       */
      goTo("staff");

      void run(
        (signal) => fetchStaff(profile.slug, service.id, signal),
        (staffOptions) => {
          setState((current) => ({ ...current, staffOptions }));
          if (staffOptions.length > 1) return;

          const only = staffOptions[0] ?? null;
          setState((current) => ({ ...current, staff: only }));
          openSlotStep(service, only, true);
        },
      );
    },
    [goTo, openSlotStep, profile.slug, run],
  );

  const start = useCallback(
    (service?: PublicService) => {
      setState(initialState);
      setHistory([]);
      setOpen(true);

      // Entrando por "Reservar" de un servicio concreto, ese paso ya está
      // contestado y el historial arranca vacío: no hay a dónde volver.
      if (service) {
        selectService(service);
        return;
      }

      setHistory(["service"]);
      setState((current) => ({ ...current, step: "service" }));
    },
    [selectService],
  );

  const close = useCallback(() => {
    pending.current?.abort();
    setOpen(false);
  }, []);

  const back = useCallback(() => {
    // El primer paso mostrado no tiene atrás: ahí "Volver" es cerrar.
    if (history.length <= 1) {
      close();
      return;
    }

    const next = history.slice(0, -1);
    setHistory(next);
    setState((current) => ({
      ...current,
      step: next[next.length - 1],
      error: null,
      slot: null,
    }));
  }, [close, history]);

  const updateCustomer = useCallback(
    (customer: { name: string; phone: string }) => {
      setState((current) => ({ ...current, customer }));
    },
    [],
  );

  const selectSlot = useCallback(
    (slot: PublicSlot) => {
      setState((current) => ({ ...current, slot }));
      goTo("details");
    },
    [goTo],
  );

  const confirm = useCallback(
    async (customer: { name: string; phone: string }) => {
      const { service, staff, slot } = state;
      if (!service || !slot) return;

      updateCustomer(customer);

      setState((current) => ({ ...current, submitting: true, error: null }));

      try {
        const confirmation = await submitBooking(profile.slug, {
          serviceId: service.id,
          staffId: staff?.id,
          startTime: slot.startTime,
          customerName: customer.name,
          customerPhone: customer.phone,
        });

        setHistory((current) => [...current, "done"]);
        setState((current) => ({
          ...current,
          step: "done",
          submitting: false,
          confirmation,
        }));
      } catch (error) {
        /*
         * Perder el horario no es un error del formulario: entre que se mostró
         * la lista y el cliente terminó de escribir su nombre, otro lo tomó. Se
         * lo devuelve al paso de horarios con la lista ya recargada, que es lo
         * único que puede hacer al respecto.
         */
        if (error instanceof BookingRequestError && error.isSlotTaken) {
          setState((current) => ({ ...current, submitting: false, slot: null }));

          if (state.date && state.service) {
            setHistory((current) =>
              current.filter((step) => step !== "details"),
            );
            setState((current) => ({ ...current, step: "slot" }));
            loadSlotsFrom(state.service, state.staff, [state.date]);
          }

          /*
           * El aviso se escribe **después** de recargar los horarios y no antes:
           * la recarga limpia el error al empezar la consulta, así que ponerlo
           * primero lo borraría y el cliente vería la lista actualizarse sola
           * sin ninguna explicación.
           */
          setState((current) => ({
            ...current,
            error: booking.flow.errors.slotTaken,
          }));
          return;
        }

        setState((current) => ({
          ...current,
          submitting: false,
          error: messageOf(error),
        }));
      }
    },
    [loadSlotsFrom, profile.slug, state, updateCustomer],
  );

  return {
    open,
    state: { ...state, canGoBack: history.length > 1 },
    start,
    close,
    back,
    selectService,
    selectStaff,
    // Un solo candidato: si el día que el cliente eligió está completo, la
    // respuesta correcta es decírselo, no saltar a otro por su cuenta.
    selectDate: (date: string) => {
      if (state.service) loadSlotsFrom(state.service, state.staff, [date]);
    },
    selectSlot,
    updateCustomer,
    confirm,
  };
}

const initialState: BookingFlowState = {
  step: "service",
  service: null,
  staff: null,
  staffOptions: [],
  days: [],
  date: null,
  slots: [],
  slot: null,
  confirmation: null,
  customer: { name: "", phone: "" },
  loading: false,
  submitting: false,
  error: null,
  canGoBack: false,
};

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

const messageOf = (error: unknown): string =>
  error instanceof BookingRequestError
    ? error.message
    : booking.flow.errors.generic;
