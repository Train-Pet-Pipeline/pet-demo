import type { Config } from "tailwindcss";
import preset from "@purrai/theme/tailwind-preset";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  presets: [preset as Config],
};
export default config;
