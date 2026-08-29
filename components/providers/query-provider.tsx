'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/**
 * El cliente de React Query para las páginas de reserva.
 *
 * Sólo envuelve a `app/(booking)`: la landing no pide nada al backend y no
 * tiene por qué cargar con esto.
 *
 * En el servidor se crea uno nuevo por render y en el navegador uno solo para
 * toda la sesión. Si se compartiera el del servidor entre peticiones, los
 * horarios de un negocio podrían servirse dentro de la página de otro.
 */
function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				/*
				 * Un solo reintento. Lo que se pide acá lo está esperando alguien con
				 * la pantalla abierta: encadenar tres intentos con espera exponencial
				 * deja a esa persona mirando un esqueleto sin saber que hubo un error.
				 */
				retry: 1,
				/*
				 * Nada de recargar al volver a la pestaña. La lista de horarios se
				 * mantiene fresca por su cuenta (`useSlots` no cachea), y refrescar lo
				 * demás porque alguien cambió de ventana es tráfico que no pidió nadie.
				 */
				refetchOnWindowFocus: false,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (isServer) return makeQueryClient();
	browserQueryClient ??= makeQueryClient();
	return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
	);
}
