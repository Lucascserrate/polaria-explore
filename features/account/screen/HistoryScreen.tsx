import Link from 'next/link';
import { account } from '@/content/account';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentDetail } from '../components/AppointmentDetail';
import type {
	CustomerAppointment,
	CustomerAppointmentDetail,
} from '@/services/customer/types';

/**
 * El historial: la lista de turnos y el que está abierto.
 *
 * **Las dos rutas son esta misma pantalla**, y de ahí sale su forma. En el
 * teléfono se ve una cosa por vez —la lista en `/historial`, el turno en
 * `/historial/<id>`— y en escritorio las dos a la vez, con la lista a la
 * izquierda. No son dos diseños: es el mismo, y lo que cambia es cuál de los dos
 * lados se esconde.
 *
 * **Quién se esconde lo decide CSS y no JavaScript**, igual que la barra del
 * sitio: qué ancho tiene la pantalla lo sabe el navegador, y resolverlo acá
 * significaría dibujar la página dos veces o esperar a que monte para saber qué
 * mostrar. El costo es que el HTML trae los dos lados; son una lista de turnos y
 * un turno, no un catálogo.
 */
export function HistoryScreen({
	upcoming,
	past,
	selected,
	focus,
}: {
	upcoming: CustomerAppointment[];
	past: CustomerAppointment[];
	/** El turno abierto, o `null` cuando la cuenta no tiene ninguno. */
	selected: CustomerAppointmentDetail | null;
	/** Qué lado manda en el teléfono. En escritorio se ven los dos. */
	focus: 'list' | 'detail';
}) {
	const empty = upcoming.length === 0 && past.length === 0;

	if (empty) return <EmptyHistory />;

	return (
		<Container width="wide" className="py-8 lg:py-12">
			<div className="lg:grid lg:grid-cols-[22rem_1fr] lg:gap-10 xl:grid-cols-[24rem_1fr]">
				<div className={cn(focus === 'detail' && 'hidden lg:block')}>
					<h1 className="mb-6 text-3xl font-semibold">
						{account.history.title}
					</h1>

					<div className="space-y-8">
						<Section
							title={account.history.upcoming}
							count={upcoming.length}
							empty={account.history.noUpcoming}
							appointments={upcoming}
							selectedId={selected?.id}
						/>

						<Section
							title={account.history.past}
							count={past.length}
							empty={account.history.noPast}
							appointments={past}
							selectedId={selected?.id}
						/>
					</div>
				</div>

				<div className={cn('mt-8 lg:mt-0', focus === 'list' && 'hidden lg:block')}>
					{/*
					 * Volver al historial sólo en el teléfono: en escritorio la lista está
					 * al lado, y una flecha para ir a algo que ya se ve sobra.
					 */}
					{focus === 'detail' && (
						<Link
							href="/historial"
							className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-600 underline-offset-4 hover:underline lg:hidden"
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="size-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="m15 18-6-6 6-6" />
							</svg>
							{account.appointment.back}
						</Link>
					)}

					{selected ? (
						<AppointmentDetail appointment={selected} />
					) : (
						<p className="hidden text-ink-500 lg:block">
							{account.history.pick}
						</p>
					)}
				</div>
			</div>
		</Container>
	);
}

/** Una de las dos listas, con su título y su cuenta. */
function Section({
	title,
	count,
	empty,
	appointments,
	selectedId,
}: {
	title: string;
	count: number;
	empty: string;
	appointments: CustomerAppointment[];
	selectedId?: string;
}) {
	return (
		<section className="space-y-3">
			<h2 className="flex items-center gap-2 font-semibold">
				{title}
				{/*
				 * La cuenta al lado del título y no adentro: es un dato del grupo, y
				 * quien usa un lector de pantalla tiene que oír "Próximas 2" y no
				 * "Próximas" a secas.
				 */}
				{count > 0 && (
					<span className="rounded-full bg-paper-200 px-2 py-0.5 text-xs text-ink-600 tabular-nums">
						{count}
					</span>
				)}
			</h2>

			{appointments.length === 0 ? (
				<p className="text-sm text-ink-500">{empty}</p>
			) : (
				<ul className="space-y-3">
					{appointments.map((appointment) => (
						<li key={appointment.id}>
							<AppointmentCard
								appointment={appointment}
								selected={appointment.id === selectedId}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

/**
 * La cuenta que todavía no reservó nada.
 *
 * Con una salida y no sólo un cartel: quien llegó acá desde el menú buscando
 * sus turnos y no tiene ninguno necesita saber a dónde ir, y el sitio tiene una
 * página de inicio que contesta eso.
 */
function EmptyHistory() {
	return (
		<Container width="narrow" className="py-16 text-center">
			<h1 className="text-3xl font-semibold">{account.history.title}</h1>

			<p className="mt-6 text-lg font-medium">{account.history.empty.title}</p>
			<p className="mt-2 text-ink-600">{account.history.empty.body}</p>

			<Button size="lg" href="/" className="mt-8">
				{account.history.empty.cta}
			</Button>
		</Container>
	);
}
