import type { Config } from "tailwindcss";
import { colors, radii, fontFamilies } from "./tokens";

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
    },
  },
};

export default preset;
