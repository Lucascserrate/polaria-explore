/**
 * Dónde está la API de Polaria.
 *
 * Sin `NEXT_PUBLIC_`, y eso es la decisión: la API **nunca** se llama desde el
 * navegador. Las páginas públicas de reserva leen los datos en el servidor y
 * mandan lo que el cliente hace por los route handlers de `app/api/booking/`,
 * que son un pasamanos delgado. Así el dominio de la API no queda escrito en el
 * HTML, no hay que abrirle CORS a la landing, y el día que la API cambie de
 * lugar se toca una variable de entorno de un solo despliegue.
 *
 * En desarrollo apunta al `nest start` de siempre.
 */
export const POLARIA_API_URL = (
  process.env.POLARIA_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

/**
 * Cuánto vale la pena cachear el perfil de un negocio.
 *
 * Un minuto: lo que cambia seguido dentro del perfil es el "abierto hasta las
 * 20:00", y un cartel que se apaga con un minuto de retraso no engaña a nadie.
 * Los horarios disponibles no pasan por acá —se piden en vivo— porque un turno
 * que ya se ocupó sí engaña.
 */
export const BUSINESS_PROFILE_REVALIDATE_SECONDS = 60;
