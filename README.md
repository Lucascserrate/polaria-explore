# Polaria — explore

El sitio público de los negocios que usan Polaria: la página de reserva de cada
uno (`/royal-barber`) y, más adelante, el marketplace donde se los busca.

La landing de Polaria y las páginas legales están en el repositorio
`polaria-landing`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # typecheck + lint
npm run build
```

Hace falta `POLARIA_API_URL` apuntando a la API de Polaria. Sin `MAPBOX_TOKEN`
el sitio levanta igual; lo único que falta es la imagen del mapa en "Dónde
estamos". Las tres variables están explicadas en AGENTS.md.

Las convenciones del proyecto —qué resuelve la API y qué no, por qué el mapa es
una imagen, dónde va el copy— están en [AGENTS.md](AGENTS.md).
