module.exports = {
  extends: ["next/core-web-vitals"],
  root: false,
  plugins: ["landing"],
  overrides: [
    {
      files: ["components/sections/**/*.{ts,tsx}"],
      rules: {
        "landing/no-hex-literals": "error",
        "landing/require-schematic-overlay": "error",
      },
    },
  ],
  settings: {
    // local plugin resolution: next will pick up via `eslint-plugin-landing/` symlink
  },
};
