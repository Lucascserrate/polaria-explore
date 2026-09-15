'use client';

import { useState } from 'react';
import Image from 'next/image';
import { booking } from '@/content/booking';
import type { PublicBusinessProfile } from '@/services/booking/types';
import { PhotoViewer } from './PhotoViewer';

/**
 * Cuántos trabajos se ven antes de abrir el visor.
 *
 * Nueve es el número que cierra el mosaico: la grande ocupa dos por dos, cuatro
 * chicas completan esas dos filas y otras cuatro forman la tercera. Con menos
 * queda un hueco en la grilla; con más, una fila suelta. El resto no se
 * esconde: la última baldosa lleva el "+N" y abre el visor, que las tiene
 * todas.
 */
const VISIBLE = 9;

/**
 * El portfolio del negocio: los trabajos terminados.
 *
 * Mosaico con una foto destacada y ocho chicas alrededor. El destacado le da
 * peso a la sección —sin él se lee como una tira de miniaturas de relleno— y
 * deja que un buen trabajo cargue con la presentación.
 *
 * Cuál es la grande no se elige: es la primera de la lista, y el portfolio
 * llega ordenado de lo más nuevo a lo más viejo. Así el corte de esta semana
 * encabeza sin que el negocio tenga que administrar nada. Ver
 * `BusinessPhotosService.list`.
 *
 * Las baldosas son cuadradas porque las fotos llegan de cualquier lado —un
 * teléfono en vertical, una captura de Instagram— y una grilla que respetara
 * cada proporción se vería como un recorte de diario. El visor las muestra
 * completas.
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

				{/*
				 * Cuatro columnas, y la primera baldosa ocupa dos por dos. Las cuatro
				 * que siguen caen solas a su derecha y las cuatro últimas forman la
				 * fila de abajo: la grilla lo resuelve sin que haya que ubicar cada
				 * una. Mismo armado en el teléfono, sólo que más chico.
				 */}
				<ul className="grid grid-cols-4 gap-2">
					{visible.map((photo, position) => {
						const isLast = position === visible.length - 1;
						const showsMore = isLast && hidden > 0;
						const isFeatured = position === 0;

						return (
							<li
								key={photo.id}
								className={isFeatured ? 'col-span-2 row-span-2' : undefined}
							>
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
										 * La destacada mide la mitad del contenedor y las chicas un
										 * cuarto. Declararlo es lo que hace que el navegador pida
										 * el tamaño que va a usar: sin esto baja la imagen entera
										 * para mostrarla a 120px.
										 */
										sizes={
											isFeatured
												? '(min-width: 1280px) 36rem, 50vw'
												: '(min-width: 1280px) 18rem, 25vw'
										}
										/*
										 * Solo la destacada con prioridad: es la más grande de la
										 * sección. Pedir las nueve a la vez las pone a competir y
										 * ninguna llega antes.
										 */
										priority={isFeatured}
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
