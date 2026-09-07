import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessProfile } from '@/services/booking/server/business';
import { getCustomerSession } from '@/services/customer/server/session';
import { BookingScreen } from '@/features/booking/screen/BookingScreen';

type Props = { params: Promise<{ businessSlug: string }> };

/**
 * El flujo de reserva no se indexa.
 *
 * No es una página de contenido: es un formulario de varios pasos cuyo estado
 * viaja en la URL, así que un buscador la vería como decenas de direcciones
 * distintas con lo mismo adentro. Lo que tiene que aparecer en Google es la
 * página del negocio, que es la que responde "qué ofrece y cuándo atiende".
 */
export const metadata: Metadata = {
	robots: { index: false, follow: true },
};

/**
 * `/[negocio]/reservar`: la pantalla de reserva.
 *
 * Reemplazó al modal que se abría sobre la página del negocio. El motivo fue
 * concreto: iniciar sesión con Google es salir del sitio, y al volver el modal
 * ya no existía —con todo lo elegido perdido—. Una pantalla con dirección
 * propia, y lo elegido en la URL, sobrevive ese viaje. Ver `useBookingFlow`.
 */
export default async function BookingPage({ params }: Props) {
	const { businessSlug } = await params;

	/*
	 * Los dos en paralelo: el perfil no depende de quién mire, y la sesión no
	 * depende del negocio.
	 */
	const [profile, customer] = await Promise.all([
		getBusinessProfile(businessSlug),
		getCustomerSession(),
	]);

	if (!profile) notFound();

	return <BookingScreen profile={profile} customer={customer} />;
}
