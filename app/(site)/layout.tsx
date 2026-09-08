import { Navbar } from '@/components/layout/navbar';
import { getCustomerSession } from '@/services/customer/server/session';

/**
 * Las rutas que llevan la barra de Polaria arriba: la raíz y las reservas.
 *
 * La barra estaba en el layout raíz —es del dominio, no de una pantalla— y bajó
 * un piso cuando apareció el buscador, que la necesita distinta. Sigue siendo
 * la misma barra en el mismo lugar para todo lo que cuelga de acá; lo que
 * cambió es que ya no la impone el documento. Ver `app/explore/layout.tsx`.
 *
 * **Leer la sesión acá vuelve dinámicas estas páginas**, incluida la raíz. Es el
 * precio de que la barra sepa quién está en sesión en cualquiera de ellas, y ya
 * lo pagábamos cuando esto vivía arriba. El día que sea un problema, la salida
 * no es mover la barra sino aislar su parte de cuenta con PPR.
 */
export default async function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getCustomerSession();

	return (
		<>
			<Navbar session={session} />
			{children}
		</>
	);
}
