import { StarGlyph } from '@/components/layout/logo';
import { landing } from '@/content/landing';
import { cn } from '@/lib/utils';

const chat = landing.conversation;

/**
 * El teléfono del cliente.
 *
 * Es la mitad de la historia que una captura del panel no puede contar: del
 * lado del negocio hay un panel, pero del lado del cliente no hay nada que
 * instalar, sólo la conversación de siempre.
 *
 * Sin verde y sin logotipo ajeno. La lectura de "esto pasa en WhatsApp" la dan
 * la forma de las burbujas y el compositor al pie, no la marca de otro — que
 * además no podemos usar (ver AGENTS.md).
 *
 * Estático a propósito. Animarlo era la tentación obvia y no aporta: acá hay
 * que entender de qué se trata en dos segundos, no ver una función en vivo.
 */
export function PhoneCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				'w-[15.5rem] shrink-0 rounded-[2.25rem] bg-ink-950 p-2 shadow-[0_30px_60px_-30px_rgb(10_10_10/0.5)]',
				className,
			)}
		>
			<div className="overflow-hidden rounded-[1.85rem] bg-white">
				<header className="flex items-center gap-2.5 border-b border-paper-300 px-3.5 py-3">
					<span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink-950">
						<StarGlyph className="size-3 text-white" />
					</span>

					<div className="min-w-0">
						<p className="truncate text-[0.8125rem] font-semibold leading-tight text-ink-950">
							{chat.contact}
						</p>
						<p className="text-[0.6875rem] leading-tight text-ink-500">
							{chat.status}
						</p>
					</div>
				</header>

				<div className="flex flex-col gap-2 bg-paper-200/60 px-3 py-4">
					{chat.messages.map((message, index) =>
						'slots' in message ? (
							<Slots key={index} slots={message.slots} />
						) : (
							<Bubble key={index} from={message.from} text={message.text} />
						),
					)}
				</div>

				<div className="flex items-center gap-2 border-t border-paper-300 px-3 py-2.5">
					<span className="h-6 flex-1 rounded-full bg-paper-200" />
					<span className="size-6 shrink-0 rounded-full bg-ink-950" />
				</div>
			</div>
		</div>
	);
}

function Bubble({ from, text }: { from: string; text: string }) {
	const mine = from === 'client';

	return (
		<p
			className={cn(
				'max-w-[85%] text-pretty rounded-2xl px-3 py-2 text-[0.8125rem] leading-snug',
				mine
					? 'self-end rounded-br-md bg-ink-950 text-white'
					: 'self-start rounded-bl-md bg-white text-ink-900 ring-1 ring-inset ring-paper-300',
			)}
		>
			{text}
		</p>
	);
}

/** Los horarios que ofrece Polaria: en el producto son botones tocables. */
function Slots({ slots }: { slots: readonly string[] }) {
	return (
		<div className="flex gap-1.5 self-start">
			{slots.map((slot) => (
				<span
					key={slot}
					className="rounded-lg bg-white px-2.5 py-1.5 text-[0.75rem] font-medium tabular-nums text-ink-950 ring-1 ring-inset ring-paper-300"
				>
					{slot}
				</span>
			))}
		</div>
	);
}
