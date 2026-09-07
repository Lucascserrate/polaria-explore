import { account } from '@/content/account';
import { Container } from '@/components/ui/container';
import type { CustomerSession } from '@/services/customer/types';

/**
 * La barra de arriba: quién está en sesión y cómo salir.
 *
 * **Sin sesión no se dibuja nada**, y es a propósito. Este sitio es la página
 * de un negocio, no la de Polaria: una barra que diga "Iniciar sesión" arriba
 * de la reserva de una barbería invita a crear una cuenta en un producto que el
 * visitante no vino a conocer. La sesión se ofrece donde hace falta —al
 * confirmar el turno— y una vez abierta, esto es lo que la hace visible y
 * reversible.
 *
 * Es un componente de servidor. El botón de salir es un `<form method="post">`,
 * así que no hay una línea de JavaScript: funciona igual con la pestaña a medio
 * cargar. Ver `app/api/customer/logout`.
 */
export function CustomerBar({ session }: { session: CustomerSession | null }) {
	if (!session) return null;

	return (
		<div className="border-b border-paper-300 bg-paper-100">
			<Container className="max-w-6xl">
				<div className="flex items-center justify-between gap-4 py-2">
					<p className="min-w-0 truncate text-sm text-ink-600">
						<span className="text-ink-500">{account.bar.label}: </span>
						<span className="font-medium text-ink-900">{session.name}</span>
					</p>

					<form method="post" action="/api/customer/logout">
						<button
							type="submit"
							className="shrink-0 rounded-full px-3 py-1 text-sm font-medium text-ink-700 underline-offset-4 hover:underline"
						>
							{account.bar.logout}
						</button>
					</form>
				</div>
			</Container>
		</div>
	);
}
