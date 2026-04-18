module.exports = {
  extends: ["next/core-web-vitals"],
  root: false,
  plugins: ["frontends"],
  overrides: [{
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "frontends/no-hex-literals": "error",
      "frontends/require-schematic-overlay": "error",
    },
  }],
};
