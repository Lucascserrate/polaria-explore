'use client';

import dynamic from 'next/dynamic';
import type { LocatedBusiness } from '@/services/explore/types';
import type { MapView } from '../map-view';

/**
 * `mapbox-gl` toca `window` al importarse, así que nada de lo que lo use puede
 * renderizarse en el servidor. Este archivo existe para ser esa frontera: acá
 * no se importa el mapa, se lo carga.
 *
 * El hueco mientras carga es del color del papel y no un rectángulo gris con un
 * cartel: el mapa llega en un parpadeo y un aviso de "cargando" que dura menos
 * que la vista se lee como un error.
 */
const ExploreMapView = dynamic(
	() => import('./ExploreMapView').then((mod) => mod.ExploreMapView),
	{
		ssr: false,
		loading: () => <div className="size-full bg-paper-200 lg:rounded-2xl" />,
	},
);

export function ExploreMap(props: {
	businesses: LocatedBusiness[];
	view: MapView;
	className?: string;
}) {
	return <ExploreMapView {...props} />;
}

export default ExploreMap;
