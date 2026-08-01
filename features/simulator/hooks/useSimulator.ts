'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
	createInitialState,
	simReducer,
} from '@/features/simulator/engine/reducer';
import { resolveTurn } from '@/features/simulator/engine/graph';
import { autoplayScript } from '@/features/simulator/data/autoplay';
import { pacing } from '@/features/simulator/data/pacing';
import { browsingSuggestions } from '@/features/simulator/data/suggestions';
import type { BarberId } from '@/features/simulator/types';

/**
 * Orquesta el motor: encola los mensajes de Polaria con sus tiempos de
 * "escribiendo…", aplica los efectos en el momento correcto y cede el control
 * al visitante en cuanto interactúa.
 *
 * Todo lo cancelable pasa por `runRef` (una tanda de respuestas queda obsoleta
 * si llega otra) y `abortedRef` (el autoplay muere apenas la persona toca algo).
 */
export function useSimulator() {
	const [state, dispatch] = useReducer(
		simReducer,
		undefined,
		createInitialState,
	);
	const [draft, setDraft] = useState('');
	const [isBusy, setIsBusy] = useState(false);

	const prefersReduced = useReducedMotion() ?? false;

	// Callback ref en vez de RefObject: así el objeto que devuelve el hook no
	// contiene refs y la UI puede leer `state` durante el render sin que el
	// analizador de React lo tome por acceso a una ref.
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const stateRef = useRef(state);
	const runRef = useRef(0);
	const aliveRef = useRef(true);
	const busyRef = useRef(false);
	const abortedRef = useRef(false);
	const autoplayStartedRef = useRef(false);
	const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
	const reducedRef = useRef(prefersReduced);

	useEffect(() => {
		stateRef.current = state;
	});

	useEffect(() => {
		reducedRef.current = prefersReduced;
	}, [prefersReduced]);

	useEffect(() => {
		const timers = timersRef.current;
		aliveRef.current = true;
		return () => {
			aliveRef.current = false;
			runRef.current += 1;
			abortedRef.current = true;
			timers.forEach(clearTimeout);
			timers.clear();
		};
	}, []);

	/** Espera cancelable. Devuelve false si la tanda quedó obsoleta o se desmontó. */
	const wait = useCallback((ms: number, run: number) => {
		const duration = reducedRef.current
			? Math.min(ms, pacing.reducedMotionMax)
			: ms;
		return new Promise<boolean>((resolve) => {
			const timer = setTimeout(() => {
				timersRef.current.delete(timer);
				resolve(aliveRef.current && runRef.current === run);
			}, duration);
			timersRef.current.add(timer);
		});
	}, []);

	/**
	 * Entrega un turno completo de Polaria. No distingue si el mensaje vino de
	 * un toque en una opción o de texto escrito a mano.
	 */
	const deliver = useCallback(
		async (rawText: string, actionId?: string) => {
			const text = rawText.trim();
			if (!text || busyRef.current) return;

			const run = ++runRef.current;
			busyRef.current = true;
			setIsBusy(true);
			setDraft('');

			const finish = () => {
				busyRef.current = false;
				if (aliveRef.current) setIsBusy(false);
			};

			dispatch({ type: 'USER_MESSAGE', text });

			const { context, agendas } = stateRef.current;
			const turn = resolveTurn(text, context, agendas, actionId);
			if (turn.context)
				dispatch({ type: 'PATCH_CONTEXT', patch: turn.context });

			// Los efectos aterrizan junto al mensaje que lleva la tarjeta de
			// confirmación; si no hay tarjeta, al cerrar el turno.
			const cardIndex = turn.messages.findIndex((m) => m.card);
			const applyAt = cardIndex === -1 ? turn.messages.length - 1 : cardIndex;

			for (let i = 0; i < turn.messages.length; i++) {
				const message = turn.messages[i];

				dispatch({ type: 'TYPING', on: true });
				if (!(await wait(message.typingMs ?? pacing.typingFallback, run))) {
					dispatch({ type: 'TYPING', on: false });
					return finish();
				}

				dispatch({
					type: 'BOT_MESSAGE',
					text: message.text,
					card: message.card,
					interactive: message.interactive,
				});

				if (i === applyAt && turn.effects?.length) {
					// Pequeño respiro para que se lea el mensaje antes de que la agenda
					// se mueva: primero el chat, después el panel del dueño.
					if (!(await wait(pacing.beforeEffects, run))) return finish();
					dispatch({ type: 'APPLY_EFFECTS', effects: turn.effects });
				}

				if (
					i < turn.messages.length - 1 &&
					!(await wait(pacing.betweenMessages, run))
				) {
					return finish();
				}
			}

			dispatch({
				type: 'SET_SUGGESTIONS',
				suggestions: turn.suggests ?? browsingSuggestions,
			});
			finish();
		},
		[wait],
	);

	const abortAutoplay = useCallback(() => {
		if (!abortedRef.current) {
			abortedRef.current = true;
			dispatch({ type: 'SET_PHASE', phase: 'live' });
		}
	}, []);

	/** Texto escrito a mano. Siempre corta el autoplay. */
	const send = useCallback(
		(text: string) => {
			abortAutoplay();
			void deliver(text);
		},
		[abortAutoplay, deliver],
	);

	/** Toque en una opción del flujo guiado. */
	const selectAction = useCallback(
		(actionId: string, label: string) => {
			abortAutoplay();
			void deliver(label, actionId);
		},
		[abortAutoplay, deliver],
	);

	const setActiveBarber = useCallback((barberId: BarberId) => {
		dispatch({ type: 'SET_ACTIVE_BARBER', barberId });
	}, []);

	/** Escribe el texto carácter por carácter en el compositor. */
	const typeInto = useCallback(
		async (text: string, run: number) => {
			if (reducedRef.current) {
				setDraft(text);
				return true;
			}
			for (let i = 1; i <= text.length; i++) {
				if (abortedRef.current || runRef.current !== run) return false;
				setDraft(text.slice(0, i));
				// Jitter determinista: humaniza sin recurrir a Math.random.
				if (!(await wait(pacing.typeCharMs + (i % 4) * 7, run))) return false;
			}
			return true;
		},
		[wait],
	);

	const runAutoplay = useCallback(async () => {
		// Si la persona ya interactuó antes de que el bloque entrara en pantalla,
		// el guion pierde sentido: la conversación ya es suya.
		if (autoplayStartedRef.current || abortedRef.current) return;
		autoplayStartedRef.current = true;

		dispatch({ type: 'SET_PHASE', phase: 'playing' });

		for (const step of autoplayScript) {
			if (abortedRef.current || !aliveRef.current) break;

			const run = runRef.current;
			if (!(await wait(step.delayBefore, run))) break;

			if (step.kind === 'type') {
				if (!(await typeInto(step.text, run))) break;
				if (!(await wait(pacing.beforeSend, run))) break;
				if (abortedRef.current) break;
				await deliver(step.text);
			} else {
				if (abortedRef.current) break;
				await deliver(step.label, step.actionId);
			}
		}

		if (aliveRef.current) dispatch({ type: 'SET_PHASE', phase: 'live' });
	}, [deliver, typeInto, wait]);

	// Arranca sola al entrar en pantalla. Antes de eso el bloque está quieto.
	useEffect(() => {
		if (!containerEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					observer.disconnect();
					void runAutoplay();
				}
			},
			{ threshold: 0.35 },
		);

		observer.observe(containerEl);
		return () => observer.disconnect();
	}, [containerEl, runAutoplay]);

	const reset = useCallback(() => {
		runRef.current += 1;
		busyRef.current = false;
		setIsBusy(false);
		setDraft('');
		abortedRef.current = true;
		autoplayStartedRef.current = true;
		dispatch({ type: 'RESET' });
		dispatch({ type: 'SET_PHASE', phase: 'live' });
	}, []);

	const markAgendaSeen = useCallback(
		() => dispatch({ type: 'SEEN_AGENDA' }),
		[],
	);

	return {
		state,
		draft,
		setDraft,
		send,
		selectAction,
		setActiveBarber,
		reset,
		isBusy,
		/** Callback ref: se pasa tal cual al `ref` del contenedor del simulador. */
		attachContainer: setContainerEl,
		abortAutoplay,
		markAgendaSeen,
		prefersReduced,
	};
}
