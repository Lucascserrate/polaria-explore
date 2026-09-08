'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Coordinates, MapPin } from '@/components/map/interactive-map';

/**
 * `mapbox-gl` toca `window` al importarse, así que no puede renderizarse en el
 * servidor. El hueco mientras carga es del color del papel y no un rectángulo
 * gris con un cartel: el mapa llega en un parpadeo y un aviso de "cargando" que
 * dura menos que la vista se lee como un error.
 */
const InteractiveMap = dynamic(
	() => import('@/components/map/interactive-map').then((mod) => mod.InteractiveMap),
	{
		ssr: false,
		loading: () => <div className="size-full rounded-2xl bg-paper-200" />,
	},
);

/**
 * El mapa del buscador: el mismo `InteractiveMap` del sitio, atado a la lista.
 *
 * Su única responsabilidad propia es qué pasa al tocar un marcador, y la
 * respuesta es la más simple que sirve: se va a la página del negocio. Un globo
 * con una tarjeta adentro —lo que hacen los buscadores grandes— es la versión
 * siguiente, y hasta que exista es mejor que el marcador haga algo que perder
 * el toque.
 *
 * **El zoom con la rueda queda como viene**, y acá sí corresponde: en un mapa
 * que se explora, arrastrar y acercar *es* la función. Lo que no se maneja con
 * la rueda es el carrusel de fotos de la reserva, que es otra cosa.
 */
export function ExploreMap({
	pins,
	center,
	zoom,
	className,
}: {
	pins: MapPin[];
	center: Coordinates;
	zoom: number;
	className?: string;
}) {
	const router = useRouter();

	return (
		<InteractiveMap
			initialCenter={center}
			zoom={zoom}
			pins={pins}
			className={className}
			onSelect={(slug) => router.push(`/${slug}`)}
		/>
	);
}

export default ExploreMap;
