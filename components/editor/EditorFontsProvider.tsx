"use client";

import {
  Inter,
  JetBrains_Mono,
  Lora,
  Merriweather,
  Montserrat,
  Playfair_Display,
  Poppins,
  Roboto,
  Roboto_Mono,
} from "next/font/google";

/**
 * Space-separated class names that expose the editor font families
 * to descendants through CSS variables. The default font (Geist)
 * is loaded via the app shell (`app/layout.tsx`) and is always
 * available.
 *
 * Keep in sync with `EDITOR_FONTS` in `lib/fonts.ts`.
 */
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--ef-roboto",
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--ef-roboto-mono",
  display: "swap",
});
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--ef-poppins",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--ef-lora",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--ef-playfair",
  display: "swap",
});
const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--ef-merriweather",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--ef-montserrat",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ef-jetbrains-mono",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--ef-inter",
  display: "swap",
});

export const EDITOR_FONT_CLASSNAMES = [
  inter.variable,
  roboto.variable,
  robotoMono.variable,
  poppins.variable,
  lora.variable,
  playfair.variable,
  merriweather.variable,
  montserrat.variable,
  jetbrains.variable,
].join(" ");