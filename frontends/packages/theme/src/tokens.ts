export const colors = {
  cream: "#FFFCF7",
  bone: "#EDE8E1",
  ink: "#1F1A17",
  clay: "#C65D3E",
  moss: "#3A5A40",
  mute: "rgba(31,26,23,0.65)",
  muteSoft: "rgba(31,26,23,0.3)",
} as const;

export const radii = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
} as const;

export const fontFamilies = {
  serif: ['"Playfair Display Variable"', '"Playfair Display"', "Georgia", "serif"].join(", "),
  sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"].join(", "),
  serifSC: ['"Noto Serif SC"', "serif"].join(", "),
} as const;

export const fontSizes = {
  hero: "48px",
  h1: "32px",
  h2: "24px",
  body: "16px",
  caption: "13px",
} as const;
