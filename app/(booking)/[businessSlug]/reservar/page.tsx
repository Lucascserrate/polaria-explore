import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { booking } from '@/content/booking';
import { getBusinessProfile } from '@/services/booking/server/business';
import { getCustomerAppointments } from '@/services/customer/server/appointments';
import { getCustomerSession } from '@/services/customer/server/session';
import { BookingScreen } from '@/features/booking/screen/BookingScreen';

type Props = { params: Promise<{ businessSlug: string }> };

/**
 * La pestaña lleva el nombre del negocio, y el buscador no entra.
 *
 * **El título es del negocio, no del sitio.** Sin esto la pestaña mostraba el
 * título por defecto del dominio —"Polaria — Tu WhatsApp, contestado."—, que es
 * la frase con la que se le habla al dueño de un local, delante de un cliente
 * que está sacando un turno. Es la misma razón por la que la página del negocio
 * usa `title.absolute`: acá abajo el nombre que manda es el de la barbería. El
 * texto está en `content/booking.ts`.
 *
 * **Y no se indexa**, que es como estaba: no es una página de contenido sino un
 * formulario de varios pasos cuyo estado viaja en la URL, así que un buscador
 * la vería como decenas de direcciones distintas con lo mismo adentro. Lo que
 * tiene que aparecer en Google es la página del negocio, que es la que responde
 * "qué ofrece y cuándo atiende".
 *
 * El perfil se pide dos veces —acá y en la página— y llega una sola: es el
 * mismo `fetch` cacheable dentro de la misma petición. Ver
 * `BUSINESS_PROFILE_REVALIDATE_SECONDS`.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { businessSlug } = await params;
	const profile = await getBusinessProfile(businessSlug);

	const robots = { index: false, follow: true } as const;

	if (!profile) return { robots };

	return {
		title: { absolute: booking.flow.metaTitle(profile.name) },
		robots,
	};
}

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
	 * Los tres en paralelo: el perfil no depende de quién mire, y la sesión no
	 * depende del negocio.
	 *
	 * Los turnos que ya tiene la cuenta sí dependen de las dos cosas, pero no
	 * esperan a ninguna: les alcanza con la cookie, que ya está en la petición.
	 * Encadenarlos a la sesión sumaría un viaje a la API antes de dibujar nada, y
	 * sin cookie ni siquiera salen. Ver `getCustomerAppointments`.
	 */
	const [profile, customer, existingAppointments] = await Promise.all([
		getBusinessProfile(businessSlug),
		getCustomerSession(),
		getCustomerAppointments(businessSlug),
	]);

	if (!profile) notFound();

	return (
		<BookingScreen
			profile={profile}
			customer={customer}
			existingAppointments={existingAppointments}
		/>
	);
}
