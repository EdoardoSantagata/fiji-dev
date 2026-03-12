import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fiji: {
          blue: "#003DA5",
          red: "#CE1126",
          cyan: "#68C8E8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
