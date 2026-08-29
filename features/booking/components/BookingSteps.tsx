"use client";

import { useState } from "react";
import { booking } from "@/content/booking";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatDayChip,
  formatDuration,
  formatLongDate,
  formatPrice,
  formatTime,
} from "../format";
import type { BookingFlowState } from "../useBookingFlow";
import type {
  PublicBusinessProfile,
  PublicService,
  PublicSlot,
  PublicStaff,
} from "../types";

/**
 * El cuerpo de cada paso del flujo.
 *
 * Todos comparten la misma forma —una lista de opciones grandes, tocables con
 * el pulgar— porque el flujo se diseñó para el teléfono: la mayoría de la gente
 * llega a esta página desde un enlace de WhatsApp, de Instagram o de un QR
 * pegado en el mostrador. En una pantalla ancha las mismas listas se ven
 * holgadas, que es el problema barato de los dos.
 */

type Handlers = {
  onSelectService: (service: PublicService) => void;
  onSelectStaff: (staff: PublicStaff | null) => void;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: PublicSlot) => void;
  /** Cada tecla: el flujo guarda lo escrito para que sobreviva a un paso atrás. */
  onChangeCustomer: (customer: { name: string; phone: string }) => void;
  onConfirm: (customer: { name: string; phone: string }) => void;
  onClose: () => void;
};

/** Fila tocable: la unidad de todas las listas del flujo. */
function OptionRow({
  title,
  meta,
  hint,
  selected,
  onClick,
}: {
  title: string;
  meta?: string;
  hint?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left",
        "ring-1 ring-paper-300 ring-inset transition-colors",
        "hover:bg-paper-200 active:bg-paper-300",
        selected && "bg-ink-950 text-white ring-ink-950 hover:bg-ink-900",
      )}
      aria-pressed={selected}
    >
      <span className="min-w-0">
        <span className="block truncate font-medium">{title}</span>
        {hint && (
          <span
            className={cn(
              "mt-0.5 block truncate text-sm",
              selected ? "text-white/70" : "text-ink-500",
            )}
          >
            {hint}
          </span>
        )}
      </span>
      {meta && (
        <span
          className={cn(
            "shrink-0 text-sm tabular-nums",
            selected ? "text-white/80" : "text-ink-600",
          )}
        >
          {meta}
        </span>
      )}
    </button>
  );
}

export function ServiceStep({
  profile,
  onSelectService,
}: {
  profile: PublicBusinessProfile;
  onSelectService: Handlers["onSelectService"];
}) {
  return (
    <div className="space-y-2">
      {profile.services.map((service) => (
        <OptionRow
          key={service.id}
          title={service.name}
          hint={formatDuration(service.durationMinutes)}
          meta={formatPrice(service.price, profile.currency)}
          onClick={() => onSelectService(service)}
        />
      ))}
    </div>
  );
}

export function StaffStep({
  state,
  onSelectStaff,
}: {
  state: BookingFlowState;
  onSelectStaff: Handlers["onSelectStaff"];
}) {
  if (state.loading && state.staffOptions.length === 0) return <StepSkeleton />;

  if (state.staffOptions.length === 0) {
    return <EmptyNote>{booking.flow.staff.empty}</EmptyNote>;
  }

  return (
    <div className="space-y-2">
      {/*
       * "Cualquier profesional" va primero y no al final: es la opción con más
       * horarios y la que elige la mayoría de la gente que no tiene preferencia,
       * que en una barbería es casi todo el mundo la primera vez.
       */}
      <OptionRow
        title={booking.flow.staff.any}
        hint={booking.flow.staff.anyHint}
        selected={state.staff === null}
        onClick={() => onSelectStaff(null)}
      />
      {state.staffOptions.map((member) => (
        <OptionRow
          key={member.id}
          title={member.name}
          hint={member.jobTitle ?? undefined}
          selected={state.staff?.id === member.id}
          onClick={() => onSelectStaff(member)}
        />
      ))}
    </div>
  );
}

export function SlotStep({
  profile,
  state,
  onSelectDate,
  onSelectSlot,
}: {
  profile: PublicBusinessProfile;
  state: BookingFlowState;
  onSelectDate: Handlers["onSelectDate"];
  onSelectSlot: Handlers["onSelectSlot"];
}) {
  if (state.days.length === 0) {
    return state.loading ? (
      <StepSkeleton />
    ) : (
      <EmptyNote>{booking.flow.slot.noDays}</EmptyNote>
    );
  }

  return (
    <div className="space-y-6">
      {/*
       * Tira horizontal en lugar de un calendario mensual. Reservar un turno es
       * casi siempre "esta semana": una grilla de treinta días obliga a leer un
       * mes entero para elegir el jueves.
       */}
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {state.days.map((day) => {
          const chip = formatDayChip(day, profile.timezone);
          const selected = state.date === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-pressed={selected}
              className={cn(
                "flex w-16 shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl py-3",
                "ring-1 ring-paper-300 ring-inset transition-colors",
                selected
                  ? "bg-ink-950 text-white ring-ink-950"
                  : "hover:bg-paper-200",
              )}
            >
              <span
                className={cn(
                  "text-xs",
                  selected ? "text-white/70" : "text-ink-500",
                )}
              >
                {chip.weekday}
              </span>
              <span className="text-lg leading-none font-semibold tabular-nums">
                {chip.day}
              </span>
              <span
                className={cn(
                  "text-xs",
                  selected ? "text-white/70" : "text-ink-500",
                )}
              >
                {chip.month}
              </span>
            </button>
          );
        })}
      </div>

      {state.loading ? (
        <StepSkeleton />
      ) : state.slots.length === 0 ? (
        <EmptyNote>{booking.flow.slot.empty}</EmptyNote>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {state.slots.map((slot) => (
            <button
              key={slot.startTime}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={cn(
                "rounded-xl py-3 text-center text-sm font-medium tabular-nums",
                "ring-1 ring-paper-300 ring-inset transition-colors",
                "hover:bg-ink-950 hover:text-white hover:ring-ink-950",
              )}
            >
              {formatTime(slot.startTime, profile.timezone)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DetailsStep({
  profile,
  state,
  onChangeCustomer,
  onConfirm,
}: {
  profile: PublicBusinessProfile;
  state: BookingFlowState;
  onChangeCustomer: Handlers["onChangeCustomer"];
  onConfirm: Handlers["onConfirm"];
}) {
  const [touched, setTouched] = useState(false);
  const { name, phone } = state.customer;

  const missingName = touched && name.trim().length === 0;
  const missingPhone = touched && phone.trim().length === 0;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim() || !phone.trim()) return;
    onConfirm({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Field
        id="booking-name"
        label={booking.flow.details.name}
        error={missingName ? booking.flow.errors.nameRequired : undefined}
      >
        <input
          id="booking-name"
          value={name}
          onChange={(event) =>
            onChangeCustomer({ name: event.target.value, phone })
          }
          placeholder={booking.flow.details.namePlaceholder}
          autoComplete="name"
          className={inputClasses}
        />
      </Field>

      <Field
        id="booking-phone"
        label={booking.flow.details.phone}
        hint={booking.flow.details.phoneHint}
        error={missingPhone ? booking.flow.errors.phoneRequired : undefined}
      >
        {/*
         * El prefijo se muestra fijo al costado y no se escribe: es el del país
         * del negocio, y es lo que permite reconocer al cliente que ya escribió
         * por WhatsApp en lugar de crearlo de nuevo. Quien tenga un número de
         * otro país puede escribirlo completo con "+" y el servidor lo respeta.
         */}
        <div className="flex items-stretch gap-2">
          <span className="flex shrink-0 items-center rounded-xl bg-paper-200 px-3 text-sm text-ink-600 tabular-nums">
            +{profile.dialCode}
          </span>
          <input
            id="booking-phone"
            value={phone}
            onChange={(event) =>
              onChangeCustomer({ name, phone: event.target.value })
            }
            placeholder={booking.flow.details.phonePlaceholder}
            inputMode="tel"
            autoComplete="tel"
            className={cn(inputClasses, "flex-1")}
          />
        </div>
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={state.submitting}
      >
        {state.submitting
          ? booking.flow.details.submitting
          : booking.flow.details.submit}
      </Button>
    </form>
  );
}

export function DoneStep({
  profile,
  state,
  onClose,
}: {
  profile: PublicBusinessProfile;
  state: BookingFlowState;
  onClose: Handlers["onClose"];
}) {
  const { confirmation } = state;
  if (!confirmation) return null;

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">{booking.flow.done.title}</h3>
        <p className="text-ink-600">
          {booking.flow.done.subtitle(profile.name)}
        </p>
      </div>

      <div className="space-y-1 rounded-2xl bg-paper-200 px-5 py-5 text-left">
        <p className="font-medium">{confirmation.serviceName}</p>
        <p className="text-ink-700 first-letter:uppercase">
          {formatLongDate(confirmation.startTime, profile.timezone)} ·{" "}
          <span className="tabular-nums">
            {formatTime(confirmation.startTime, profile.timezone)}
          </span>
        </p>
        {confirmation.staffName && (
          <p className="text-sm text-ink-500">
            {booking.flow.summary.with(confirmation.staffName)}
          </p>
        )}
      </div>

      <Button size="lg" className="w-full" onClick={onClose}>
        {booking.flow.done.close}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------

const inputClasses =
  "w-full rounded-xl bg-paper-100 px-4 py-3 text-ink-900 ring-1 ring-paper-300 " +
  "ring-inset outline-none placeholder:text-ink-500 focus:ring-2 focus:ring-accent-500";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-attention-700">{error}</p>
      ) : (
        hint && <p className="text-sm text-ink-500">{hint}</p>
      )}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-paper-200 px-5 py-6 text-center text-ink-600">
      {children}
    </p>
  );
}

/**
 * Espera con la forma de lo que viene, no con un cartel de "cargando".
 *
 * Tres barras del alto de una fila: la lista aparece en el mismo lugar donde ya
 * estaba el hueco, así que la pantalla no salta cuando llega la respuesta.
 */
function StepSkeleton() {
  return (
    <div className="space-y-2" aria-live="polite" aria-busy="true">
      <span className="sr-only">{booking.flow.slot.loading}</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-16 animate-pulse rounded-2xl bg-paper-200" />
      ))}
    </div>
  );
}
