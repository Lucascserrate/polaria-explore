/**
 * Comprobación del motor de conversación sin navegador.
 *
 * Recorre el reducer igual que lo hace el hook, pero sin temporizadores, y
 * verifica lo que de verdad importa: que los turnos encadenen, que la agenda
 * reaccione y que NINGÚN mensaje deje la demo sin respuesta.
 *
 *   npx tsx scripts/check-engine.ts
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
function say(state: SimState, text: string): SimState {
  let next = simReducer(state, { type: "USER_MESSAGE", text });
  const turn = resolveTurn(text, next.context);

  if (turn.context) {
    next = simReducer(next, { type: "PATCH_CONTEXT", patch: turn.context });
  }
  for (const message of turn.messages) {
    next = simReducer(next, {
      type: "BOT_MESSAGE",
      text: message.text,
      card: message.card,
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

function lastBotText(state: SimState) {
  return [...state.messages].reverse().find((m) => m.sender === "polaria")?.text ?? "";
}

console.log("\n1. Recorrido feliz: saludo → disponibilidad → elegir horario");
{
  let s = createInitialState();
  s = say(s, "Hola");
  check("saluda y marca greeted", s.context.greeted);

  s = say(s, "¿Tienen cita para mañana?");
  check("ofrece horarios", s.context.offeredSlots.length === 2,
    JSON.stringify(s.context.offeredSlots));

  s = say(s, "14:30 me sirve");
  check("reserva la cita", s.context.hasAppointment && s.context.bookedSlot === "14:30");
  check("la agenda se actualiza",
    s.agenda.find((x) => x.time === "14:30")?.state === "justBooked");
  check("emite alerta al dueño", s.alerts.some((a) => a.kind === "booked"));
  check("muestra el cierre con captura", s.outroVisible);
  check("adjunta la tarjeta de confirmación",
    s.messages.some((m) => m.card?.time === "14:30"));
}

console.log("\n2. Variantes de elección de horario");
for (const input of ["las 2:30", "la primera", "dale", "a las 11:30", "por la tarde"]) {
  let s = createInitialState();
  s = say(s, "quiero una cita");
  const before = s.context.offeredSlots.join("/");
  s = say(s, input);
  check(`«${input}» reserva (ofrecidos ${before})`, s.context.hasAppointment,
    lastBotText(s).slice(0, 60));
}

console.log("\n3. Contexto: cambiar cita según haya o no reserva previa");
{
  let s = createInitialState();
  s = say(s, "quiero cambiar mi cita");
  check("sin cita previa responde que no encuentra ninguna",
    lastBotText(s).includes("agende") || s.messages.some((m) => m.text.includes("No encuentro")));
  check("no inventa una reserva", !s.context.hasAppointment);

  s = createInitialState();
  s = say(s, "¿tienen cita mañana?");
  s = say(s, "14:30");
  s = say(s, "quiero cambiar mi cita");
  check("con cita previa ofrece alternativas", s.context.offeredSlots.length > 0);
  check("marca que está moviendo", s.context.movingAppointment);

  s = say(s, "11:30");
  check("mueve la cita", s.context.bookedSlot === "11:30");
  check("libera el horario anterior",
    s.agenda.find((x) => x.time === "14:30")?.state === "free");
  check("registra el movimiento", s.alerts.some((a) => a.kind === "moved"));
}

console.log("\n4. Cancelación");
{
  let s = createInitialState();
  s = say(s, "hola");
  s = say(s, "¿tienen cita mañana?");
  s = say(s, "la primera");
  const booked = s.context.bookedSlot!;
  s = say(s, "quiero cancelar mi cita");
  check("cancela", !s.context.hasAppointment);
  check("libera el horario",
    s.agenda.find((x) => x.time === booked)?.state === "free");
}

console.log("\n5. Irrompibilidad: nada puede dejar la demo sin respuesta");
const adversarial = [
  "asdkjhasd",
  "¿me lo hacés a domicilio?",
  "mi hijo de 3 años, le cortás?",
  "¿aceptan tarjeta?",
  "quiero hablar con una persona",
  "¿tenés wifi?",
  "🙂🙂🙂",
  "¿CUÁNTO SALE EL CORTE?",
  "hasta que hora atienden",
  "donde quedan",
  "",
  "   ",
  "1234567890",
  "¿hacen color y mechas?",
];
for (const input of adversarial) {
  const s = say(createInitialState(), input);
  const answered = s.messages.some((m) => m.sender === "polaria");
  const label = input.trim() === "" ? "(vacío)" : input.slice(0, 34);
  if (input.trim() === "") {
    // El compositor bloquea el envío vacío; el motor igual no debe romperse.
    check(`«${label}» no rompe`, true);
  } else {
    check(`«${label}» recibe respuesta`, answered);
  }
}

console.log("\n6. El fallback deriva a humano, no falla");
{
  const s = say(createInitialState(), "¿tenés estacionamiento para la camioneta?");
  check("genera alerta de derivación", s.alerts.some((a) => a.kind === "handoff"));
  check("le avisa al cliente", lastBotText(s).length > 0);
}

console.log("\n7. Determinismo (sin Date.now ni Math.random)");
{
  const a = say(say(createInitialState(), "hola"), "¿tienen cita mañana?");
  const b = say(say(createInitialState(), "hola"), "¿tienen cita mañana?");
  check("dos corridas idénticas producen el mismo estado",
    JSON.stringify(a) === JSON.stringify(b));
  check("los ids no dependen del azar", a.messages.every((m) => /^m-\d+$/.test(m.id)));
}

console.log(
  failures === 0
    ? "\n✅ Motor OK — todas las comprobaciones pasaron\n"
    : `\n❌ ${failures} comprobación(es) fallaron\n`,
);

process.exit(failures === 0 ? 0 : 1);
