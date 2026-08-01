<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Polaria — landing

Asistente de WhatsApp para peluquerías y barberías. Esta es la landing oficial
y, además, el sitio que Meta revisa para aprobar WhatsApp Business API.

## Comandos

```bash
npm run dev            # desarrollo
npm run check          # typecheck + lint + comprobación del motor
npm run check:engine   # sólo el motor del simulador, sin navegador
npm run build
```

## Reglas del proyecto

- **`app/page.tsx` no lleva maquetación ni copy.** Sólo ordena secciones.
- **Todo el copy vive en `content/`.** Si estás escribiendo texto visible dentro
  de un `.tsx`, está en el lugar equivocado.
- **Los CTA no se deciden en las secciones.** Se piden a `config/cta.ts` y se
  renderizan con `<Cta>`. Ver "El switch de CTA" abajo.
- **`features/simulator/` es un módulo cerrado.** No importa nada de
  `sections/`. Adaptar la demo a otro rubro debería ser editar `data/`.
- **Server Components por defecto.** Sólo son cliente el simulador, la
  calculadora y los formularios. El FAQ usa `<details>` nativo a propósito.
- **Sin `Date.now()` ni `Math.random()` en el simulador.** El reloj es ficticio
  y los ids salen de un contador: si no, se rompe la hidratación.

## El switch de CTA

El CTA ideal ("escribile a Polaria por WhatsApp") necesita un número aprobado
por Meta, y esa aprobación necesita este sitio. Por eso el CTA es configuración:

```ts
// config/cta.ts
export const CTA_MODE: CtaMode = "simulador"; // → "whatsapp" cuando haya número
export const whatsapp = { number: "" };       // completar acá
```

Cambiar esas dos líneas convierte todos los CTA de la página. No hay que tocar
ninguna sección.

## Antes de publicar

Buscar los `TODO` en `config/site.ts` y `content/legal.ts`: dominio, correo,
razón social y domicilio deben ser reales y verificables para la revisión de
Meta. `app/api/waitlist/route.ts` valida pero todavía no persiste nada.

## Restricciones de marca (no negociables)

No usar el logotipo de WhatsApp, Meta ni Google, no imitar su interfaz al pixel
y no insinuar afiliación. El descargo de `content/integrations.ts` va sí o sí
en el footer.
