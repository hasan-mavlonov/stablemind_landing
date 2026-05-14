import type { Config } from "tailwindcss";

/**
 * Tailwind v4 reads its theme primarily from globals.css via @theme.
 * This config is kept for editor tooling and to make the palette explicit.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7EE",
        tomato: "#E84A3C",
        mustard: "#E8B53C",
        leaf: "#4A8B3C",
        sky: "#3C7AE8",
        plum: "#7A3CE8",
        bone: "#F8F4E8",
        charcoal: "#1A1A1A",
        offblack: "#0A0A0A",
        offwhite: "#F8F8F8",
      },
    },
  },
};

export default config;
