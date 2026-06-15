import React from "react";

/**
 * LoadingScreen — shown while lab config and machine data are being fetched
 * on initial application mount.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080d14]">
      {/* Radial glow behind the logo */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo mark */}
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-900/50">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="h-11 w-11"
              aria-hidden="true"
            >
              {/* Stylised "LV" atom-like mark */}
              <circle cx="20" cy="20" r="3" fill="white" />
              <ellipse
                cx="20"
                cy="20"
                rx="16"
                ry="7"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity="0.7"
              />
              <ellipse
                cx="20"
                cy="20"
                rx="16"
                ry="7"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity="0.7"
                transform="rotate(60 20 20)"
              />
              <ellipse
                cx="20"
                cy="20"
                rx="16"
                ry="7"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity="0.7"
                transform="rotate(-60 20 20)"
              />
            </svg>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl animate-ping bg-blue-500/20" />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Lab<span className="text-blue-400">Verse</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 tracking-widest uppercase">
            Engineering Laboratory Intelligence
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500">Loading lab environment…</p>
        </div>
      </div>
    </div>
  );
}
