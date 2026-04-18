module.exports = {
  extends: ["next/core-web-vitals"],
  root: false,
  plugins: ["frontends"],
  overrides: [
    {
      files: ["components/sections/**/*.{ts,tsx}"],
      rules: {
        "frontends/no-hex-literals": "error",
        "frontends/require-schematic-overlay": "error",
      },
    },
  ],
  settings: {
    // local plugin resolution: next will pick up via `eslint-plugin-frontends/` symlink
  },
};
