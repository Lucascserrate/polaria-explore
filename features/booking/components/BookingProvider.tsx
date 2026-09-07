"use client";

import { createContext, useContext, useMemo } from "react";
import { useBookingFlow } from "../useBookingFlow";
import type { PublicBusinessProfile, PublicService } from "@/services/booking/types";
import type { CustomerSession } from "@/services/customer/types";
import { BookingDialog } from "./BookingDialog";

/**
 * Une los botones de la página con el flujo de reserva.
 *
 * Existe porque hay tres lugares desde donde se empieza a reservar —el
 * "Reservar" de cada servicio, la tarjeta fija del escritorio y la barra
 * inferior del teléfono— y los tres tienen que abrir **el mismo** flujo, con el
 * mismo estado. Sin un lugar común, cada uno tendría su copia y volver atrás en
 * uno no significaría nada en los otros.
 *
 * Envuelve a la página entera pero deja pasar sus hijos tal cual: el
 * encabezado, los horarios y la ubicación siguen siendo componentes de
 * servidor. Lo único que se vuelve cliente es lo que se toca.
 */

type BookingContextValue = {
  /** Sin servicio abre por el primer paso; con uno, se lo saltea. */
  start: (service?: PublicService) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking(): BookingContextValue {
  const value = useContext(BookingContext);
  if (!value) {
    throw new Error("useBooking necesita un <BookingProvider> por encima.");
  }
  return value;
}

export function BookingProvider({
  profile,
  customer,
  children,
}: {
  profile: PublicBusinessProfile;
  /**
   * La sesión de quien reserva, resuelta en el servidor. `null` si no inició
   * sesión, que es como llega casi todo el mundo la primera vez.
   */
  customer: CustomerSession | null;
  children: React.ReactNode;
}) {
  const flow = useBookingFlow(profile, customer);
  const value = useMemo(() => ({ start: flow.start }), [flow.start]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      {flow.open && (
        <BookingDialog
          profile={profile}
          state={flow.state}
          onBack={flow.back}
          onClose={flow.close}
          onSelectService={flow.selectService}
          onSelectStaff={flow.selectStaff}
          onSelectDate={flow.selectDate}
          onSelectSlot={flow.selectSlot}
          onSessionChange={flow.updateSession}
          onConfirm={flow.confirm}
        />
      )}
    </BookingContext.Provider>
  );
}
