/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LabVerse design tokens
        lv: {
          bg:      "#080d14",   // page background
          surface: "#0d1117",   // panels, sheets
          card:    "#111827",   // cards
          border:  "#1e2d40",   // borders
          muted:   "#1f2937",   // muted backgrounds
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: 0, transform: "translateX(20px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        "fade-in":        "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-ring":     "pulse-ring 2s ease-in-out infinite",
      },
      // Pannellum viewer occupies the full viewport
      height: {
        screen: "100dvh",
      },
    },
  },
  plugins: [],
};
