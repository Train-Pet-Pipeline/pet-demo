import type { Config } from "tailwindcss";
import { colors, radii, fontFamilies, fontSizes } from "./tokens";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        cream: colors.cream,
        bone: colors.bone,
        ink: colors.ink,
        clay: colors.clay,
        moss: colors.moss,
        mute: colors.mute,
        "mute-soft": colors.muteSoft,
      },
      borderRadius: radii,
      fontFamily: {
        serif: fontFamilies.serif,
        sans: fontFamilies.sans,
        "serif-sc": fontFamilies.serifSC,
      },
      fontSize: {
        hero: fontSizes.hero,
        h1: fontSizes.h1,
        h2: fontSizes.h2,
        body: fontSizes.body,
        caption: fontSizes.caption,
      },
    },
  },
};

export default preset;
