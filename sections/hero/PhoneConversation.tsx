'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StarGlyph } from '@/components/layout/logo';
import { Check, CheckDouble, ChevronRight, Send } from '@/components/ui/icons';
import { hero } from '@/content/hero';
import {
	heroChat,
	type Attachment,
	type ChatOption,
	type ChatStep,
} from '@/content/hero-chat';
import { timeline } from '@/sections/hero/timeline';
import { cn } from '@/lib/utils';

/**
 * El teléfono del hero: la conversación tal como la ve el cliente.
 *
 * Todo lo que se dibuja acá se deriva del índice de fotograma (`frame`), que
 * gobierna `HeroShowcase`. Este componente no tiene estado propio ni
 * temporizadores; lo único que hace por su cuenta es seguir el scroll interno.
 *
 * Decisión de color, distinta a la del simulador a propósito: en el simulador
 * Polaria habla en azul a la izquierda para que su voz domine el cuadro. Acá el
 * objetivo es otro — que se lea "esto pasa en WhatsApp" en medio segundo — así
 * que respetamos la convención del mensajero: lo que entra va en blanco a la
 * izquierda y lo que manda el cliente va coloreado a la derecha. Coloreado en
 * azul de marca, nunca en el verde de WhatsApp.
 */
export function PhoneConversation({
	frame,
	run,
	reduced,
}: {
	frame: number;
	run: number;
	reduced: boolean;
}) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const current = timeline.frames[frame];

	// Seguir la conversación dentro del teléfono, sin tocar el scroll de la
	// página. En el reinicio volvemos arriba de golpe: animar el rebobinado sólo
	// llamaría la atención sobre el corte.
	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		if (frame === 0) {
			element.scrollTop = 0;
			return;
		}

		element.scrollTo({
			top: element.scrollHeight,
			behavior: reduced ? 'auto' : 'smooth',
		});
	}, [frame, reduced]);

	return (
		<div
			role="img"
			aria-label={hero.phone.a11y}
			className={cn(
				'relative w-70 shrink-0 rounded-[2.5rem] bg-ink-900 p-[0.4rem] sm:w-74',
				'shadow-[0_2px_4px_rgb(6_8_15/0.16),0_28px_60px_-24px_rgb(6_8_15/0.4),0_60px_120px_-60px_rgb(6_8_15/0.5)]',
				'ring-1 ring-inset ring-white/10',
			)}
		>
			{/* Marco interior: el borde vivo entre chasis y pantalla. */}
			<div className="overflow-hidden rounded-[2.15rem] bg-black/40 p-px">
				<div className="flex h-120 flex-col overflow-hidden rounded-[2.1rem] bg-paper-200 sm:h-132">
					<StatusBar />
					<ChatHeader />

					<div
						ref={scrollRef}
						aria-hidden="true"
						className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#f8f9fb_0%,#eef0f5_55%,#e8ebf2_100%)] px-2.5 py-3"
					>
						{/*
              `mt-auto` pega la conversación al compositor mientras es corta,
              como en cualquier mensajero. Cuando crece y desborda, el margen
              automático se resuelve en cero y el scroll vuelve a funcionar
              normalmente — a diferencia de `justify-end`, que en algunos
              navegadores deja el principio del hilo inalcanzable.

              La `key` reinicia las animaciones de entrada en cada vuelta.
            */}
						<div key={run} className="mt-auto flex flex-col gap-1.5">
							<p className="mx-auto mb-1 rounded-full bg-white/70 px-2.5 py-0.5 text-[0.625rem] font-medium text-ink-500 ring-1 ring-inset ring-ink-900/5">
								{heroChat.dayPill}
							</p>

							{heroChat.steps.map((step, index) => {
								const cue = timeline.cues[index];
								if (frame < cue.say) return null;

								const picked =
									cue.pick !== undefined && frame >= cue.pick
										? (step.pick?.index ?? null)
										: null;
								const replied = cue.reply !== undefined && frame >= cue.reply;

								return (
									<div key={index} className="flex flex-col gap-1.5">
										{step.from === 'polaria' ? (
											<Incoming step={step} picked={picked} />
										) : (
											<Outgoing text={step.text} time={step.time} />
										)}

										{replied && step.pick && (
											<Outgoing text={step.pick.reply} time={step.pick.time} />
										)}
									</div>
								);
							})}

							{current?.kind === 'typing' && <Typing />}
						</div>
					</div>

					<Composer />
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Chrome del teléfono                                                        */
/* -------------------------------------------------------------------------- */

/** La hora es la del último mensaje del guion, no la del reloj real. */
function StatusBar() {
	const clock = heroChat.steps[heroChat.steps.length - 1].time;

	return (
		<div className="relative flex items-center justify-between bg-ink-900 px-5 pb-1.5 pt-2 text-[0.625rem] font-medium text-white/85">
			<span className="font-mono tabular-nums">{clock}</span>

			{/* La isla del sensor es lo que convierte un rectángulo en un teléfono. */}
			<span className="absolute left-1/2 top-1.5 h-3.5 w-14 -translate-x-1/2 rounded-full bg-black" />

			<span className="flex items-center gap-1" aria-hidden="true">
				<span className="flex items-end gap-px">
					{[3, 5, 7, 9].map((height) => (
						<span
							key={height}
							className="w-[2px] rounded-full bg-white/70"
							style={{ height: `${height}px` }}
						/>
					))}
				</span>

				<span className="ml-0.5 h-2.5 w-5 rounded-[3px] p-[2px] ring-1 ring-white/50">
					<span className="block h-full w-2/3 rounded-[1px] bg-white/70" />
				</span>
			</span>
		</div>
	);
}

function ChatHeader() {
	return (
		<div className="flex items-center gap-2.5 bg-ink-900 px-3 pb-2.5 pt-1">
			<span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 ring-1 ring-inset ring-white/20">
				<StarGlyph className="size-3.5 text-white" />
			</span>

			<div className="min-w-0 flex-1">
				<p className="truncate text-[0.8125rem] font-semibold leading-tight text-white">
					{heroChat.contact.name}
				</p>
				<p className="flex items-center gap-1 text-[0.625rem] leading-tight text-white/60">
					<span className="size-1.5 rounded-full bg-confirm-500" />
					{heroChat.contact.status} · {heroChat.contact.answeredBy}
				</p>
			</div>
		</div>
	);
}

/** Compositor en reposo: el cliente reserva tocando, no escribiendo. */
function Composer() {
	return (
		<div className="flex items-center gap-2 border-t border-ink-900/5 bg-white/70 px-2.5 py-2">
			<span className="flex-1 truncate rounded-full bg-paper-200 px-3 py-1.5 text-[0.6875rem] text-ink-500 ring-1 ring-inset ring-ink-900/5">
				{heroChat.composerPlaceholder}
			</span>
			<span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600">
				<Send className="size-3.5 text-white" />
			</span>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Burbujas                                                                   */
/* -------------------------------------------------------------------------- */

function Outgoing({ text, time }: { text: string; time: string }) {
	return (
		<div className="flex justify-end motion-safe:animate-bubble-in">
			<div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-2.5 py-1.5 shadow-sm">
				<p className="text-[0.8125rem] leading-snug text-white">{text}</p>
				<span className="mt-0.5 flex items-center justify-end gap-1 text-[0.5625rem] text-white/65">
					<span className="font-mono tabular-nums">{time}</span>
					<CheckDouble className="size-3" />
				</span>
			</div>
		</div>
	);
}

function Incoming({ step, picked }: { step: ChatStep; picked: number | null }) {
	return (
		<div className="flex justify-start motion-safe:animate-bubble-in">
			<div
				className={cn(
					'overflow-hidden rounded-2xl rounded-bl-md bg-white shadow-sm ring-1 ring-inset ring-ink-900/[0.06]',
					step.attach ? 'w-[92%]' : 'max-w-[85%]',
				)}
			>
				<div className="px-2.5 py-1.5">
					<p className="text-pretty text-[0.8125rem] leading-snug text-ink-900">
						{step.text}
					</p>
					<span className="mt-0.5 block text-right font-mono text-[0.5625rem] tabular-nums text-ink-500">
						{step.time}
					</span>
				</div>

				{step.attach && <AttachmentView attach={step.attach} picked={picked} />}
			</div>
		</div>
	);
}

function Typing() {
	return (
		<div className="flex justify-start motion-safe:animate-bubble-in">
			<div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-2.5 shadow-sm ring-1 ring-inset ring-ink-900/[0.06]">
				{[0, 1, 2].map((index) => (
					<span
						key={index}
						className="size-1.5 rounded-full bg-ink-500/60 motion-safe:animate-typing-dot"
						style={{ animationDelay: `${index * 0.16}s` }}
					/>
				))}
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Mensajes interactivos                                                      */
/* -------------------------------------------------------------------------- */

function AttachmentView({
	attach,
	picked,
}: {
	attach: Attachment;
	picked: number | null;
}) {
	if (attach.kind === 'buttons') {
		return <Chips items={attach.items} picked={picked} />;
	}

	if (attach.kind === 'slots') {
		return (
			<div className="border-t border-paper-200 p-2">
				<SectionLabel>{attach.title}</SectionLabel>
				<Chips items={attach.items} picked={picked} columns={3} mono bare />
			</div>
		);
	}

	if (attach.kind === 'list') {
		return (
			<div className="border-t border-paper-200">
				<div className="px-2.5 pt-1.5">
					<SectionLabel>{attach.title}</SectionLabel>
				</div>

				<ul className="mt-1">
					{attach.items.map((item, index) => {
						const state = stateOf(index, picked);

						return (
							<li
								key={item.label}
								className={cn(
									'flex items-center gap-2 border-t border-paper-200 px-2.5 py-[0.4rem] transition duration-300',
									state === 'picked' && 'bg-brand-50',
									state === 'dimmed' && 'opacity-40',
								)}
							>
								<span
									className={cn(
										'min-w-0 flex-1 truncate text-xs font-medium',
										state === 'picked' ? 'text-brand-700' : 'text-ink-900',
									)}
								>
									{item.label}
								</span>

								{item.meta && (
									<span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-ink-600">
										{item.meta}
									</span>
								)}

								{state === 'picked' ? (
									<Check className="size-3.5 shrink-0 text-brand-600 motion-safe:animate-pick-pop" />
								) : (
									<ChevronRight className="size-3.5 shrink-0 text-ink-500/50" />
								)}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	const isDone = attach.tone === 'done';

	return (
		<div className="border-t border-paper-200 p-2">
			<div
				className={cn(
					'rounded-xl p-2.5 ring-1 ring-inset',
					isDone
						? 'bg-confirm-50 ring-confirm-500/25'
						: 'bg-paper-100 ring-paper-300',
				)}
			>
				<p
					className={cn(
						'flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-wider',
						isDone ? 'text-confirm-700' : 'text-ink-500',
					)}
				>
					{isDone && <Check className="size-3" />}
					{attach.title}
				</p>

				<dl className="mt-1.5 flex flex-col gap-[0.2rem] text-[0.6875rem]">
					{attach.rows.map((row) => (
						<div key={row.label} className="flex items-baseline gap-3">
							<dt className="shrink-0 text-ink-500">{row.label}</dt>
							<dd className="flex-1 truncate text-right font-medium text-ink-900">
								{row.value}
							</dd>
						</div>
					))}
				</dl>
			</div>

			{attach.items && (
				<div className="pt-2">
					<Chips items={attach.items} picked={picked} bare />
				</div>
			)}
		</div>
	);
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-500">
			{children}
		</p>
	);
}

/**
 * Botones de respuesta rápida y horarios.
 *
 * Una o dos columnas según el largo de las etiquetas: apilar cuatro nombres
 * cortos desperdicia pantalla, y meter "Sin preferencia" en media columna la
 * parte al medio.
 */
function Chips({
	items,
	picked,
	columns,
	mono = false,
	bare = false,
}: {
	items: readonly ChatOption[];
	picked: number | null;
	columns?: number;
	mono?: boolean;
	bare?: boolean;
}) {
	const resolved =
		columns ?? (items.every((item) => item.label.length <= 12) ? 2 : 1);

	return (
		<div
			className={cn(
				'grid gap-1.5',
				bare ? 'mt-1.5' : 'border-t border-paper-200 p-2',
				resolved === 3 && 'grid-cols-3',
				resolved === 2 && 'grid-cols-2',
				resolved === 1 && 'grid-cols-1',
			)}
		>
			{items.map((item, index) => {
				const state = stateOf(index, picked);

				return (
					<span
						key={item.label}
						className={cn(
							'rounded-lg px-2 py-1.5 text-center text-[0.6875rem] font-medium ring-1 ring-inset transition duration-300',
							mono && 'font-mono tabular-nums',
							state === 'picked'
								? 'bg-brand-600 text-white ring-brand-600 motion-safe:animate-pick-pop'
								: 'bg-paper-100 text-brand-700 ring-paper-300',
							state === 'dimmed' && 'opacity-40',
						)}
					>
						{item.label}
						{item.meta && (
							<span className="ml-1 font-mono tabular-nums opacity-70">
								{item.meta}
							</span>
						)}
					</span>
				);
			})}
		</div>
	);
}

function stateOf(index: number, picked: number | null) {
	if (picked === null) return 'idle' as const;
	return index === picked ? ('picked' as const) : ('dimmed' as const);
}
