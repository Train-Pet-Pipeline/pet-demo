// frontends/apps/playground/lhci.config.cjs
module.exports = {
  ci: {
    collect: {
      startServerCommand: "bash -c 'mkdir -p public && rm -rf public/artifacts && cp -r tests/fixtures/artifacts-test public/artifacts && pnpm start'",
      url: ["http://localhost:3200/", "http://localhost:3200/fixture-ai-1"],
      numberOfRuns: 3,
      settings: { preset: "desktop" },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
