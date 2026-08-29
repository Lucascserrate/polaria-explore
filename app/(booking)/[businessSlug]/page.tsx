import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { booking } from "@/content/booking";
import { getBusinessProfile } from "@/services/booking/server/business";
import {
  MobileBookingBar,
  ServiceList,
} from "@/features/booking/components/BookButton";
import { BookingProvider } from "@/features/booking/components/BookingProvider";
import { BookingSidebar } from "@/features/booking/components/BookingSidebar";
import { BusinessHeader } from "@/features/booking/components/BusinessHeader";
import {
  LocationPanel,
  SchedulePanel,
} from "@/features/booking/components/BusinessPanels";
import { describeStatus } from "@/features/booking/format";

/**
 * La página pública de reservas de un negocio: `polariahq.com/royal-barber`.
 *
 * Como `app/(marketing)/page.tsx`, no lleva maquetación propia ni copy: ordena
 * secciones. El orden es la única decisión de diseño que se toma acá, y dice de
 * qué se trata la página: quién es el negocio y si está abierto, después los
 * servicios con su precio y su botón, y recién al final los horarios y la
 * dirección.
 *
 * Los servicios van arriba porque son la pregunta que trae a la gente —cuánto
 * sale y cuándo puedo ir—, no porque sean lo más lindo de mostrar. Todo lo que
 * se meta entre el encabezado y esa lista empuja la reserva fuera de la primera
 * pantalla.
 *
 * El segmento es `[businessSlug]` en la raíz, así que convive con las rutas
 * estáticas de la landing: `/privacy` y `/terms` ganan sobre el dinámico, y por
 * eso esos nombres están reservados del lado del backend (ver `RESERVED_SLUGS`).
 */

type Props = { params: Promise<{ businessSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { businessSlug } = await params;
  const profile = await getBusinessProfile(businessSlug);

  if (!profile) return {};

  /*
   * El título es el nombre del negocio a secas: es lo que se lee en la pestaña
   * y en la vista previa cuando alguien pega el enlace en WhatsApp. La plantilla
   * global le agregaría "· Polaria", que en el chat de una barbería es ruido.
   */
  const description = [
    describeStatus(profile.status),
    profile.address,
    booking.header.servicesCount(profile.services.length),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: { absolute: profile.name },
    description,
    alternates: { canonical: `/${profile.slug}` },
    openGraph: {
      type: "website",
      title: profile.name,
      description,
      url: `/${profile.slug}`,
    },
  };
}

export default async function BusinessBookingPage({ params }: Props) {
  const { businessSlug } = await params;
  const profile = await getBusinessProfile(businessSlug);

  // Un slug que no existe es un 404 de verdad, no una pantalla de error: la
  // URL la escribe gente a mano y se equivoca.
  if (!profile) notFound();

  return (
    <BookingProvider profile={profile}>
      <main className="pb-10">
        <Container className="max-w-6xl py-6 sm:py-10">
          <BusinessHeader profile={profile} />

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="space-y-12">
              <section aria-labelledby="servicios" className="space-y-4">
                <h2 id="servicios" className="text-xl font-semibold">
                  {booking.services.title}
                </h2>
                <ServiceList profile={profile} />
              </section>

              <SchedulePanel profile={profile} />
              <LocationPanel profile={profile} />
            </div>

            <BookingSidebar profile={profile} />
          </div>
        </Container>
      </main>

      <MobileBookingBar profile={profile} />
    </BookingProvider>
  );
}
