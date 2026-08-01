import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

/**
 * Imagen para compartir. ImageResponse sólo admite flexbox y un subconjunto de
 * CSS: nada de grid, nada de background-clip en texto.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#06080f",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -260,
            left: 240,
            width: 720,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(closest-side, rgba(31,107,255,0.55), transparent)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 1.5c.62 5.6 4.9 9.88 10.5 10.5-5.6.62-9.88 4.9-10.5 10.5-.62-5.6-4.9-9.88-10.5-10.5C7.1 11.38 11.38 7.1 12 1.5Z"
              fill="#82b4ff"
            />
          </svg>
          <span style={{ color: "#ffffff", fontSize: 38, fontWeight: 600 }}>
            {site.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#ffffff",
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -2.5,
              maxWidth: 900,
            }}
          >
            Contestá todos los mensajes sin soltar la tijera.
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 32, marginTop: 28 }}>
            Asistente de WhatsApp para peluquerías y barberías.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
