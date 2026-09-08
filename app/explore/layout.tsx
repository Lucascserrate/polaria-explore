import { Navbar } from '@/components/layout/navbar';
import { getCustomerSession } from '@/services/customer/server/session';

/**
 * El buscador lleva la barra sólo en escritorio.
 *
 * En el teléfono el mapa ocupa la pantalla entera, y una barra fija arriba le
 * come el alto justo donde más se nota; la lista, sin ella, abre directamente
 * con las tarjetas. En escritorio el mapa es un panel al costado y no la
 * pantalla, así que la barra no le saca nada, y sacarla dejaría al buscador sin
 * marca y sin forma de entrar a la cuenta o volver a la raíz.
 *
 * Se esconde con una clase y no se deja de renderizar: qué ancho tiene la
 * pantalla lo sabe CSS, y decidirlo en JavaScript significaría dibujar la
 * página una vez con barra y otra sin ella. El costo es que el HTML la trae
 * igual; es una barra, no una lista de negocios.
 *
 * Es la única ruta del sitio con un encabezado propio. Las demás lo heredan de
 * `app/(site)/layout.tsx`.
 */
export default async function ExploreLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getCustomerSession();

	return (
		<>
			<div className="hidden lg:block">
				<Navbar session={session} />
			</div>
			{children}
		</>
	);
}
