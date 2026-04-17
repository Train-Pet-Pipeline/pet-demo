import { Inter, Playfair_Display, Noto_Serif_SC } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const notoSerifSc = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});
