'use client';

import { useState } from 'react';
import Image from 'next/image';
import { booking } from '@/content/booking';
import type { PublicBusinessProfile } from '@/services/booking/types';
import { PhotoViewer } from './PhotoViewer';

/**
 * Cuántos trabajos se ven antes de abrir el visor.
 *
 * Nueve llena tres filas de tres en el teléfono y dos de cinco desde `sm`, así
 * que la sección no pasa a ser una tira interminable con treinta fotos. El
 * resto no se esconde: la última baldosa lleva el "+N" y abre el visor, que es
 * donde están todas.
 */
const VISIBLE = 9;

/**
 * El portfolio del negocio: los trabajos terminados.
 *
 * Baldosas todas iguales y no un mosaico con una foto grande, al revés que la
 * galería de arriba. Es deliberado: acá ninguna foto es la principal —son
 * treinta cortes y valen lo mismo— y un destacado repetiría el gesto que ya
 * hace la portada del local a unos centímetros, compitiendo con ella.
 *
 * Cuadradas porque llegan de cualquier lado —un teléfono en vertical, una
 * captura de Instagram— y una grilla que respetara cada proporción se vería
 * como un recorte de diario. El visor las muestra completas.
 */
export function PortfolioPanel({
	profile,
}: {
	profile: PublicBusinessProfile;
}) {
	const { portfolio, name } = profile;
	const [viewerAt, setViewerAt] = useState<number | null>(null);

	// Sin trabajos no hay sección: no se deja un hueco donde irían.
	if (portfolio.length === 0) return null;

	const visible = portfolio.slice(0, VISIBLE);
	const hidden = portfolio.length - visible.length;

	return (
		<>
			<section aria-labelledby="portfolio" className="space-y-4">
				<div className="flex items-center gap-2">
					<h2 id="portfolio" className="text-xl font-semibold">
						{booking.portfolio.title}
					</h2>
					{/*
					 * El total al lado del título, como en el resto de la página: dice
					 * cuánto hay sin que haya que contar las baldosas ni abrir el visor.
					 */}
					<span className="rounded-full border border-paper-300 px-2 py-0.5 text-xs font-medium text-ink-500">
						{booking.portfolio.count(portfolio.length)}
					</span>
				</div>

				<ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
					{visible.map((photo, position) => {
						const isLast = position === visible.length - 1;
						const showsMore = isLast && hidden > 0;

						return (
							<li key={photo.id}>
								<button
									type="button"
									aria-label={
										showsMore
											? booking.portfolio.more(hidden)
											: booking.portfolio.open
									}
									onClick={() => setViewerAt(position)}
									className="relative block aspect-square w-full overflow-hidden rounded-lg bg-paper-200"
								>
									<Image
										src={photo.url}
										alt={booking.portfolio.photoAlt(
											name,
											position + 1,
											portfolio.length,
										)}
										fill
										/*
										 * Las baldosas son chicas: un tercio del ancho en el
										 * teléfono y un quinto del contenedor desde `sm`, que topa
										 * en 72rem. Sin declararlo, el navegador baja la imagen
										 * completa para mostrarla a 120px.
										 */
										sizes="(min-width: 1280px) 14rem, (min-width: 640px) 20vw, 33vw"
										className="object-cover"
									/>

									{showsMore && (
										/*
										 * El "+N" va sobre la última y no en un botón aparte: es la
										 * baldosa que ya está diciendo "hay más", y un botón al pie
										 * sería un segundo lugar para la misma acción.
										 */
										<span className="absolute inset-0 grid place-items-center bg-ink-950/55 text-lg font-semibold text-paper-50">
											{booking.portfolio.more(hidden)}
										</span>
									)}
								</button>
							</li>
						);
					})}
				</ul>
			</section>

			{viewerAt !== null && (
				<PhotoViewer
					photos={portfolio}
					name={name}
					startAt={viewerAt}
					onClose={() => setViewerAt(null)}
				/>
			)}
		</>
	);
}
