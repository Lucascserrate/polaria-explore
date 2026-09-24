import { ChevronRight, type LucideIcon } from 'lucide-react';

/**
 * Una acción del turno como fila: icono, texto y la flecha de "esto lleva a
 * algún lado".
 *
 * **Filas y no botones**, porque cambiar y cancelar son dos entradas de la
 * misma lista y no dos llamados a la acción. Dos píldoras apiladas a todo el
 * ancho se leían como el final de un formulario —el lugar donde se aprieta
 * algo— en una pantalla que se viene a leer.
 *
 * El icono dice cuál es cuál antes que el texto, que es lo que hace falta
 * cuando una de las dos no se puede deshacer.
 *
 * Son sólo las clases y el contenido, y no el elemento: cambiar el horario es un
 * enlace que dibuja el servidor y cancelar es un botón de cliente, y los dos
 * tienen que verse exactamente igual.
 */
export const actionItemClasses =
	'-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-3 text-left font-medium transition-colors hover:bg-paper-200 disabled:pointer-events-none disabled:opacity-40';

export function ActionItemContent({
	icon: Icon,
	children,
}: {
	icon: LucideIcon;
	children: React.ReactNode;
}) {
	return (
		<>
			<Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
			<span className="min-w-0 flex-1">{children}</span>
			<ChevronRight
				aria-hidden="true"
				className="size-4 shrink-0 text-ink-500"
			/>
		</>
	);
}
