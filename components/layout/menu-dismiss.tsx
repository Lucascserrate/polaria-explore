'use client';

import { useEffect } from 'react';

/**
 * Cierra el menú de la cuenta con Escape o con un clic afuera.
 *
 * Es una mejora, no un requisito: el menú es un `<details>` y abre, cierra y
 * responde al teclado sin JavaScript. Esto agrega las dos cosas que el elemento
 * nativo no hace y que cualquiera espera de un menú —Escape y clic afuera—, así
 * que si el script no llega a ejecutarse lo único que se pierde es la
 * comodidad: el menú sigue cerrándose tocando de nuevo el avatar.
 *
 * Vive dentro del propio `<details>` y lo busca con `closest`, en lugar de
 * recibir un `ref`: así el contenedor sigue siendo un componente de servidor y
 * lo único que cruza al navegador son estas líneas.
 */
export function MenuDismiss() {
	useEffect(() => {
		const menus = document.querySelectorAll<HTMLDetailsElement>(
			'details[data-customer-menu]',
		);

		const closeAll = () => {
			menus.forEach((menu) => {
				menu.open = false;
			});
		};

		const onPointerDown = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Element)) return;

			// Un clic dentro del propio menú no lo cierra: ahí adentro hay botones.
			if (target.closest('details[data-customer-menu]')) return;

			closeAll();
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeAll();
		};

		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, []);

	return null;
}
