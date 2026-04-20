// frontends/apps/landing/lhci.config.cjs
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm start",
      url: ["http://localhost:3100/", "http://localhost:3100/en"],
      numberOfRuns: 3,
      settings: { preset: "desktop" },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
