import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { booking } from '@/content/booking';
import { getBusinessProfile } from '@/services/booking/server/business';
import {
	MobileBookingBar,
	ServiceList,
} from '@/features/booking/components/BookButton';
import { BookingSidebar } from '@/features/booking/components/BookingSidebar';
import { BackButton } from '@/features/booking/components/BackButton';
import { BusinessGallery } from '@/features/booking/components/BusinessGallery';
import { PortfolioPanel } from '@/features/booking/components/PortfolioPanel';
import { BusinessHeader } from '@/features/booking/components/BusinessHeader';
import {
	LocationPanel,
	SchedulePanel,
	TeamPanel,
} from '@/features/booking/components/BusinessPanels';
import { describeStatus } from '@/features/booking/format';
import { CATEGORY_PARAM } from '@/features/booking/booking-url';

type Props = {
	params: Promise<{ businessSlug: string }>;
	/**
	 * El filtro de categoría vive en la URL y lo resuelve el servidor.
	 *
	 * Es lo que deja que la fila de categorías sean enlaces y que la página siga
	 * sin JavaScript propio. `generateMetadata` no lo mira: el título y la
	 * descripción son del negocio, no de la categoría que alguien esté viendo.
	 */
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
		.join(' · ');

	return {
		title: { absolute: profile.name },
		description,
		alternates: { canonical: `/${profile.slug}` },
		openGraph: {
			type: 'website',
			title: profile.name,
			description,
			url: `/${profile.slug}`,
		},
	};
}

export default async function BusinessBookingPage({
	params,
	searchParams,
}: Props) {
	const { businessSlug } = await params;
	const query = await searchParams;

	// Repetido en la URL se queda con el primero: un arreglo acá es alguien
	// armando la dirección a mano, no algo que la página pueda producir.
	const rawCategory = query[CATEGORY_PARAM];
	const activeCategory = Array.isArray(rawCategory)
		? rawCategory[0]
		: rawCategory;

	const profile = await getBusinessProfile(businessSlug);

	// Un slug que no existe es un 404 de verdad, no una pantalla de error: la
	// URL la escribe gente a mano y se equivoca.
	if (!profile) notFound();

	const hasPhotos = profile.photos.length > 0;

	return (
		<>
			<main className="pb-10">
				<Container className="max-w-6xl pb-6 pt-0 sm:py-10">
					<div className="flex flex-col">
						<div className="relative z-10 order-2 -mx-5 -mt-4 rounded-t-2xl bg-paper-50 px-5 pt-5 sm:order-1 sm:mx-0 sm:mt-0 sm:rounded-none sm:px-0 sm:pt-0">
							{!hasPhotos && <BackButton variant="inline" className="mb-4" />}
							<BusinessHeader profile={profile} />
						</div>
						<div className="relative order-1 sm:order-2 sm:mt-6">
							<BusinessGallery profile={profile} />
							{hasPhotos && (
								<BackButton
									variant="overlay"
									className="absolute top-4 left-0 z-10"
								/>
							)}
						</div>
					</div>

					{/*
					 * `grid-cols-1` no es decoración: sin él la columna del teléfono es
					 * una pista implícita `auto`, que mide por el contenido más ancho. La
					 * fila de categorías se arrastra con el dedo, así que es más ancha que
					 * la pantalla: la grilla entera crecía con ella y empujaba la página
					 * hacia la derecha. `grid-cols-1` es `minmax(0,1fr)` —lo mismo que ya
					 * hace la fila de `lg`— y el `min-w-0` de la columna termina de atar
					 * el desborde adentro del carrusel, que es donde tiene que estar.
					 */}
					<div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
						<div className="min-w-0 space-y-12">
							<section aria-labelledby="servicios" className="space-y-4">
								<h2 id="servicios" className="text-xl font-semibold">
									{booking.services.title}
								</h2>
								<ServiceList
									profile={profile}
									activeCategory={activeCategory}
								/>
							</section>

							<SchedulePanel profile={profile} />
							<TeamPanel profile={profile} />
							{/*
							 * Después del equipo y antes de la ubicación: los trabajos son el
							 * argumento para venir, y la dirección es lo que se mira recién
							 * cuando ya se decidió.
							 */}
							<PortfolioPanel profile={profile} />
							<LocationPanel profile={profile} />
						</div>

						<BookingSidebar profile={profile} />
					</div>
				</Container>
			</main>

			<MobileBookingBar profile={profile} />
		</>
	);
}
