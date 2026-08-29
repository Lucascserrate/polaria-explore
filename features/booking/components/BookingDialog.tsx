"use client";

import { useEffect, useRef } from "react";
import { booking } from "@/content/booking";
import { cn } from "@/lib/utils";
import { formatDuration, formatLongDate, formatPrice, formatTime } from "../format";
import type { BookingFlowState, BookingStep } from "../useBookingFlow";
import type { PublicBusinessProfile } from "@/services/booking/types";
import {
  DetailsStep,
  DoneStep,
  ServiceStep,
  SlotStep,
  StaffStep,
} from "./BookingSteps";

/**
 * El contenedor del flujo: encabezado, resumen de lo elegido y el paso actual.
 *
 * En el teléfono ocupa la pantalla entera y no es un cuadro flotante. Un modal
 * chico en un móvil deja el fondo asomando por los bordes y compite con lo que
 * hay que mirar; a pantalla completa, elegir un horario es lo único que pasa.
 * En escritorio sí es un cuadro centrado, donde el contexto de atrás ayuda.
 */

const titles: Record<BookingStep, string> = {
  service: booking.flow.service.title,
  staff: booking.flow.staff.title,
  slot: booking.flow.slot.title,
  details: booking.flow.details.title,
  done: "",
};

export function BookingDialog({
  profile,
  state,
  onBack,
  onClose,
  onSelectService,
  onSelectStaff,
  onSelectDate,
  onSelectSlot,
  onChangeCustomer,
  onConfirm,
}: {
  profile: PublicBusinessProfile;
  state: BookingFlowState;
  onBack: () => void;
  onClose: () => void;
  onSelectService: React.ComponentProps<typeof ServiceStep>["onSelectService"];
  onSelectStaff: React.ComponentProps<typeof StaffStep>["onSelectStaff"];
  onSelectDate: React.ComponentProps<typeof SlotStep>["onSelectDate"];
  onSelectSlot: React.ComponentProps<typeof SlotStep>["onSelectSlot"];
  onChangeCustomer: React.ComponentProps<typeof DetailsStep>["onChangeCustomer"];
  onConfirm: React.ComponentProps<typeof DetailsStep>["onConfirm"];
}) {
  const panel = useRef<HTMLDivElement>(null);

  /**
   * Escape cierra, y el fondo no se mueve mientras el flujo está abierto.
   *
   * El scroll del fondo importa más en el teléfono que en el escritorio: sin
   * bloquearlo, arrastrar la lista de horarios termina moviendo la página de
   * atrás cuando la lista llega a su final.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // El foco entra al panel para que el lector de pantalla anuncie el paso y
  // para que el tabulador no siga recorriendo la página de atrás.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  const isDone = state.step === "done";

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={titles[state.step] || booking.flow.done.title}
        tabIndex={-1}
        className={cn(
          "relative flex w-full flex-col bg-paper-50 outline-none",
          "sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl sm:shadow-[0_40px_80px_-32px_rgb(11_13_16/0.45)]",
        )}
      >
        <header className="flex items-center gap-2 border-b border-paper-300 px-4 py-3 sm:px-6">
          {!isDone && (
            <button
              type="button"
              onClick={onBack}
              aria-label={state.canGoBack ? booking.flow.back : booking.flow.close}
              className="-ml-2 rounded-full p-2 text-ink-600 transition-colors hover:bg-paper-200 hover:text-ink-900"
            >
              {state.canGoBack ? <BackIcon /> : <CloseIcon />}
            </button>
          )}

          <h2 className="min-w-0 flex-1 truncate text-base font-semibold">
            {titles[state.step]}
          </h2>

          {!isDone && state.canGoBack && (
            <button
              type="button"
              onClick={onClose}
              aria-label={booking.flow.close}
              className="-mr-2 rounded-full p-2 text-ink-600 transition-colors hover:bg-paper-200 hover:text-ink-900"
            >
              <CloseIcon />
            </button>
          )}
        </header>

        {!isDone && <Summary profile={profile} state={state} />}

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {state.error && !isDone && (
            <p
              role="alert"
              className="mb-4 rounded-2xl bg-attention-50 px-4 py-3 text-sm text-attention-700"
            >
              {state.error}
            </p>
          )}

          {state.step === "service" && (
            <ServiceStep profile={profile} onSelectService={onSelectService} />
          )}
          {state.step === "staff" && (
            <StaffStep state={state} onSelectStaff={onSelectStaff} />
          )}
          {state.step === "slot" && (
            <SlotStep
              profile={profile}
              state={state}
              onSelectDate={onSelectDate}
              onSelectSlot={onSelectSlot}
            />
          )}
          {state.step === "details" && (
            <DetailsStep
              profile={profile}
              state={state}
              onChangeCustomer={onChangeCustomer}
              onConfirm={onConfirm}
            />
          )}
          {isDone && (
            <DoneStep profile={profile} state={state} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Lo elegido hasta ahora, en una línea.
 *
 * Está para que nadie llegue al último paso sin saber qué está reservando. Va
 * arriba y fijo: en el teléfono, el paso de horarios es largo y el nombre del
 * servicio queda fuera de la pantalla apenas se hace scroll.
 */
function Summary({
  profile,
  state,
}: {
  profile: PublicBusinessProfile;
  state: BookingFlowState;
}) {
  if (!state.service) return null;

  const parts = [
    formatDuration(state.service.durationMinutes),
    formatPrice(state.service.price, profile.currency),
  ];

  if (state.step !== "staff") {
    parts.push(
      state.staff ? state.staff.name : booking.flow.summary.anyStaff,
    );
  }

  if (state.slot) {
    parts.push(
      `${formatLongDate(state.slot.startTime, profile.timezone)}, ${formatTime(
        state.slot.startTime,
        profile.timezone,
      )}`,
    );
  }

  return (
    <div className="border-b border-paper-300 bg-paper-100 px-4 py-3 sm:px-6">
      <p className="truncate font-medium">{state.service.name}</p>
      <p className="truncate text-sm text-ink-500">{parts.join(" · ")}</p>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 4 6 10l6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
