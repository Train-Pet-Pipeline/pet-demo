import { describe, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { RuleTester } = require("eslint");
const plugin = require("../index.cjs");

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } } });

describe("no-hex-literals", () => {
  it("validates code via RuleTester (throws on failure)", () => {
    tester.run("no-hex-literals", plugin.rules["no-hex-literals"], {
      valid: [{ code: "const x = 'red';" }, { code: "const x = 'transparent';" }],
      invalid: [{ code: "const x = '#abc';", errors: [{ messageId: "hex" }] }],
    });
  });
});

describe("require-schematic-overlay", () => {
  it("validates code via RuleTester (throws on failure)", () => {
    tester.run("require-schematic-overlay", plugin.rules["require-schematic-overlay"], {
      valid: [
        { code: "import { SchematicOverlay } from '@purrai/ui';", filename: "frontends/apps/landing/components/sections/Hero.tsx" },
        { code: "import { IllustrationBadge } from '@purrai/ui';", filename: "frontends/apps/landing/components/other.tsx" },
      ],
      invalid: [
        { code: "import { IllustrationBadge } from '@purrai/ui';", filename: "frontends/apps/landing/components/sections/Hero.tsx", errors: [{ messageId: "direct" }] },
      ],
    });
  });
});
