import { account } from '@/content/account';
import { site } from '@/config/site';
import { initials } from '@/lib/initials';
import type { CustomerSession } from '@/services/customer/types';
import { MenuDismiss } from './menu-dismiss';

/**
 * El menú de la cuenta: el círculo con las iniciales y lo que hay detrás.
 *
 * **Es un `<details>` y no un menú con estado**, y eso es deliberado: abre y
 * cierra sin una línea de JavaScript, responde al teclado por su cuenta y —lo
 * que importa— deja "Cerrar sesión" alcanzable aunque el script no llegue a
 * ejecutarse. Con un `useState` habría dos cosas que dependen de JS: abrir el
 * menú y, adentro, la única forma de salir de la sesión. `MenuDismiss` agrega
 * cerrar con Escape y con un clic afuera cuando hay JS, que es una comodidad,
 * no un requisito.
 *
 * **Sólo lleva lo que existe.** La referencia de la que salió esto tiene ocho
 * entradas —historial, billetera, mensajes, favoritos, formularios, ajustes—;
 * ninguna tiene a dónde ir en Polaria todavía, y un menú de enlaces muertos es
 * peor que uno corto. "Mis reservas" entra acá el día que exista.
 *
 * "Para negocios" va al final, separado y detrás de un clic. Es el único
 * enlace del sitio que le habla al dueño de un negocio: en la barra de la raíz
 * está a la vista —ahí es la puerta del marketplace y no la página de nadie—,
 * pero este menú también aparece arriba de la reserva de una barbería, y ahí
 * suelto sería el enlace más visible del local de otro. Detrás de un clic sigue
 * estando para quien lo busca. Ver `Navbar` y `AGENTS.md`.
 */
export function CustomerMenu({ session }: { session: CustomerSession }) {
	return (
		<details className="group relative" data-customer-menu>
			<summary
				aria-label={account.menu.open}
				className="flex cursor-pointer list-none items-center gap-1.5 rounded-full py-1 pr-1 pl-1 outline-offset-2 [&::-webkit-details-marker]:hidden"
			>
				<span
					aria-hidden="true"
					className="grid size-9 place-items-center rounded-full bg-paper-200 text-sm font-medium text-ink-700"
				>
					{initials(session.name)}
				</span>

				{/* La flecha gira al abrir: es la única señal de que esto se despliega. */}
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="size-4 text-ink-500 transition-transform group-open:rotate-180"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</summary>

			{/*
			 * `right-0` y no `left-0`: el menú cuelga del borde derecho de su botón,
			 * que está pegado al borde de la pantalla. Abriéndose hacia la izquierda
			 * nunca se sale, sin importar el ancho.
			 */}
			<div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl bg-white py-2 shadow-lg ring-1 ring-paper-300">
				<div className="px-4 pt-2 pb-3">
					<p className="truncate font-semibold">{session.name}</p>
					{session.email && (
						<p className="truncate text-sm text-ink-500">{session.email}</p>
					)}
				</div>

				<div className="border-t border-paper-300 py-1">
					{/*
					 * Un `<form>` y no un enlace: cerrar sesión cambia estado, y un `GET`
					 * lo puede disparar cualquier cosa que precargue direcciones,
					 * incluido el propio navegador.
					 */}
					<form method="post" action="/api/customer/logout">
						<button
							type="submit"
							className="w-full px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-paper-200"
						>
							{account.bar.logout}
						</button>
					</form>
				</div>

				<div className="border-t border-paper-300 pt-1">
					<a
						href={site.landingUrl}
						className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-paper-200"
					>
						{account.forBusiness}
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="size-4 shrink-0 text-ink-500"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M5 12h14m-6-6 6 6-6 6" />
						</svg>
					</a>
				</div>
			</div>

			<MenuDismiss />
		</details>
	);
}
