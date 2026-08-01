"use client";

/** Los tres puntos. Con movimiento reducido queda estático pero sigue anunciándose. */
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-brand-600 px-4 py-3.5"
        aria-label="Polaria está escribiendo"
        role="status"
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-white/80 motion-safe:animate-[typing-dot_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${index * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}
