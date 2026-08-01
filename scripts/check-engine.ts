/**
 * Comprobación del motor de conversación sin navegador.
 *
 * Recorre el reducer igual que lo hace el hook, pero sin temporizadores, y
 * verifica lo que de verdad importa: que la reserva guiada encadene, que la
 * disponibilidad dependa del profesional, que la agenda reaccione y que NINGÚN
 * mensaje deje la demo sin respuesta.
 *
 *   npm run check:engine
 */
import { resolveTurn } from "@/features/simulator/engine/graph";
import { createInitialState, simReducer } from "@/features/simulator/engine/reducer";
import type { SimState } from "@/features/simulator/types";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok    ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Aplica un turno completo de forma síncrona. */
function act(state: SimState, label: string, actionId?: string): SimState {
  let next = simReducer(state, { type: "USER_MESSAGE", text: label });
  const turn = resolveTurn(label, state.context, state.agendas, actionId);

  if (turn.context) {
    next = simReducer(next, { type: "PATCH_CONTEXT", patch: turn.context });
  }
  for (const message of turn.messages) {
    next = simReducer(next, {
      type: "BOT_MESSAGE",
      text: message.text,
      card: message.card,
      interactive: message.interactive,
    });
  }
  if (turn.effects?.length) {
    next = simReducer(next, { type: "APPLY_EFFECTS", effects: turn.effects });
  }
  return simReducer(next, {
    type: "SET_SUGGESTIONS",
    suggestions: turn.suggests ?? [],
  });
}

const say = (state: SimState, text: string) => act(state, text);
const tap = (state: SimState, actionId: string, label = actionId) =>
  act(state, label, actionId);

function lastActions(state: SimState) {
  return (
    [...state.messages].reverse().find((m) => m.interactive)?.interactive?.actions ?? []
  );
}
function actionIds(state: SimState) {
  return lastActions(state).map((a) => a.id);
}
function lastBotText(state: SimState) {
  return [...state.messages].reverse().find((m) => m.sender === "polaria")?.text ?? "";
}
function slotOf(state: SimState, barberId: string, time: string) {
  return state.agendas[barberId].find((s) => s.time === time);
}

console.log("\n1. Reserva guiada completa (el camino del autoplay)");
{
  let s = createInitialState();

  s = say(s, "Hola");
  check("el saludo abre el menú de acciones",
    actionIds(s).includes("menu:reservar"), actionIds(s).join(", "));
  check("el menú son botones",
    lastActions(s).length === 3 &&
      [...s.messages].reverse().find((m) => m.interactive)?.interactive?.kind === "buttons");

  s = tap(s, "menu:reservar", "Reservar una cita");
  check("ofrece la lista de servicios", s.context.flowStep === "service");
  check("los servicios muestran precio y duración",
    lastActions(s).every((a) => /Bs \d+ · \d+ min/.test(a.description ?? "")),
    JSON.stringify(lastActions(s).map((a) => a.description)));

  s = tap(s, "service:corte-barba", "Corte + barba");
  check("pregunta por el profesional", s.context.flowStep === "barber");
  check("incluye la opción sin preferencia", actionIds(s).includes("barber:any"));
  check("cada barbero muestra cuántos huecos tiene",
    lastActions(s).some((a) => /2 horarios libres/.test(a.description ?? "")) &&
      lastActions(s).some((a) => /3 horarios libres/.test(a.description ?? "")),
    JSON.stringify(lastActions(s).map((a) => a.description)));

  s = tap(s, "barber:martin", "Martín");
  check("ofrece horarios", s.context.flowStep === "slot");
  check("son exactamente los huecos de Martín",
    JSON.stringify(s.context.offeredSlots) === JSON.stringify(["11:30", "14:30"]),
    JSON.stringify(s.context.offeredSlots));
  check("el panel derecho salta a la agenda de Martín", s.activeBarberId === "martin");

  s = tap(s, "slot:14:30", "14:30");
  check("confirma la cita", s.context.hasAppointment && s.context.bookedSlot === "14:30");
  check("ocupa el hueco en la agenda de Martín",
    slotOf(s, "martin", "14:30")?.state === "justBooked");
  check("no toca la agenda de Rocío",
    slotOf(s, "rocio", "14:30")?.state === "busy" &&
      slotOf(s, "rocio", "16:00")?.state === "free");
  check("la tarjeta nombra al profesional",
    s.messages.some((m) => m.card?.staff === "Martín" && m.card?.time === "14:30"));
  check("avisa al dueño", s.alerts.some((a) => a.kind === "booked"));
  check("muestra el cierre con captura", s.outroVisible);
  check("las opciones ya usadas quedan deshabilitadas",
    s.messages.filter((m) => m.interactive).every((m) => m.actionsResolved));
}

console.log("\n2. La disponibilidad depende del profesional");
{
  const base = tap(
    tap(say(createInitialState(), "hola"), "menu:reservar"),
    "service:corte",
  );

  const conMartin = tap(base, "barber:martin", "Martín");
  const conRocio = tap(base, "barber:rocio", "Rocío");
  const sinPreferencia = tap(base, "barber:any", "Sin preferencia");

  check("Martín ofrece 11:30 y 14:30",
    JSON.stringify(conMartin.context.offeredSlots) === JSON.stringify(["11:30", "14:30"]),
    JSON.stringify(conMartin.context.offeredSlots));
  check("Rocío ofrece 09:00, 16:00 y 17:00",
    JSON.stringify(conRocio.context.offeredSlots) ===
      JSON.stringify(["09:00", "16:00", "17:00"]),
    JSON.stringify(conRocio.context.offeredSlots));
  check("los dos conjuntos son distintos",
    JSON.stringify(conMartin.context.offeredSlots) !==
      JSON.stringify(conRocio.context.offeredSlots));
  check("sin preferencia une ambas agendas",
    JSON.stringify(sinPreferencia.context.offeredSlots) ===
      JSON.stringify(["09:00", "11:30", "14:30"]),
    JSON.stringify(sinPreferencia.context.offeredSlots));

  const asignada = tap(sinPreferencia, "slot:09:00", "09:00");
  check("sin preferencia asigna a quien tenga el hueco",
    asignada.context.bookedBarberId === "rocio",
    String(asignada.context.bookedBarberId));
  check("y lo dice en el mensaje",
    asignada.messages.some((m) => m.text.includes("Rocío")));
  check("ocupa el hueco de Rocío, no el de Martín",
    slotOf(asignada, "rocio", "09:00")?.state === "justBooked" &&
      slotOf(asignada, "martin", "09:00")?.state === "busy");
}

console.log("\n3. El flujo también funciona escribiendo a mano");
{
  let s = say(createInitialState(), "quiero reservar una cita");
  check("el texto libre entra al flujo guiado", s.context.flowStep === "service");

  s = say(s, "corte + barba");
  check("elige servicio escribiéndolo", s.context.flowStep === "barber");

  s = say(s, "con Rocío");
  check("elige profesional escribiéndolo",
    s.context.flowStep === "slot" && s.context.selectedBarberId === "rocio");

  s = say(s, "las 4 de la tarde");
  check("elige horario en formato 12h", s.context.bookedSlot === "16:00",
    String(s.context.bookedSlot));
}

console.log("\n4. «Sin preferencia» escrito a mano");
{
  let s = tap(tap(say(createInitialState(), "hola"), "menu:reservar"), "service:corte");
  s = say(s, "me da igual");
  check("interpreta «me da igual»", s.context.selectedBarberId === "any",
    String(s.context.selectedBarberId));
}

console.log("\n5. Consultas conversacionales devuelven al flujo");
for (const [input, needle] of [
  ["¿cuánto cuesta un corte?", "Bs 50"],
  ["¿hasta qué hora atienden?", "Lunes a sábado"],
  ["¿dónde están?", "Av. Las Américas"],
] as const) {
  const s = say(createInitialState(), input);
  check(`«${input}» responde y ofrece reservar`,
    s.messages.some((m) => m.text.includes(needle)) &&
      actionIds(s).includes("menu:reservar"));
}

console.log("\n6. Cambiar y cancelar respetan la agenda del profesional");
{
  let s = tap(
    tap(tap(say(createInitialState(), "hola"), "menu:reservar"), "service:corte"),
    "barber:martin",
  );
  s = tap(s, "slot:14:30", "14:30");

  s = say(s, "quiero cambiar mi cita");
  check("ofrece los otros huecos de Martín",
    JSON.stringify(s.context.offeredSlots) === JSON.stringify(["11:30"]),
    JSON.stringify(s.context.offeredSlots));

  s = tap(s, "slot:11:30", "11:30");
  check("mueve la cita", s.context.bookedSlot === "11:30");
  check("libera el horario anterior", slotOf(s, "martin", "14:30")?.state === "free");
  check("ocupa el nuevo", slotOf(s, "martin", "11:30")?.state === "justBooked");

  s = say(s, "quiero cancelar mi cita");
  check("cancela", !s.context.hasAppointment);
  check("libera el hueco", slotOf(s, "martin", "11:30")?.state === "free");
}

console.log("\n7. Irrompibilidad: nada deja la demo sin respuesta");
const adversarial = [
  "asdkjhasd",
  "¿me lo hacés a domicilio?",
  "mi hijo de 3 años, le cortás?",
  "¿aceptan tarjeta?",
  "quiero hablar con una persona",
  "¿tenés wifi?",
  "🙂🙂🙂",
  "¿CUÁNTO SALE EL CORTE?",
  "1234567890",
  "¿hacen color y mechas?",
];
for (const input of adversarial) {
  const s = say(createInitialState(), input);
  check(`«${input.slice(0, 34)}» recibe respuesta`,
    s.messages.some((m) => m.sender === "polaria"));
}

// Lo mismo, pero interrumpiendo el flujo guiado a mitad de camino.
{
  const midFlow = tap(say(createInitialState(), "hola"), "menu:reservar");
  for (const input of ["cualquier cosa rara", "¿tenés estacionamiento?"]) {
    const s = say(midFlow, input);
    check(`«${input}» dentro del flujo no rompe`,
      s.messages.some((m) => m.sender === "polaria"));
  }
}

console.log("\n8. El fallback deriva a humano, no falla");
{
  const s = say(createInitialState(), "¿tenés estacionamiento para la camioneta?");
  check("genera alerta de derivación", s.alerts.some((a) => a.kind === "handoff"));
  check("sale del flujo guiado", s.context.flowStep === null);
  check("le avisa al cliente", lastBotText(s).length > 0);
}

console.log("\n9. Determinismo (sin Date.now ni Math.random)");
{
  const run = () => tap(say(createInitialState(), "hola"), "menu:reservar");
  check("dos corridas idénticas producen el mismo estado",
    JSON.stringify(run()) === JSON.stringify(run()));
  check("los ids no dependen del azar",
    run().messages.every((m) => /^m-\d+$/.test(m.id)));
}

console.log(
  failures === 0
    ? "\n✅ Motor OK — todas las comprobaciones pasaron\n"
    : `\n❌ ${failures} comprobación(es) fallaron\n`,
);

process.exit(failures === 0 ? 0 : 1);
