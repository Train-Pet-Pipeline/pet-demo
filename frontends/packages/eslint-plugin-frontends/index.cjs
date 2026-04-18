"use strict";

const noHexLiterals = {
  meta: { type: "problem", docs: { description: "Disallow hex color literals; use Modern Warm tokens." }, schema: [], messages: { hex: "Hex color literal '{{value}}' — use @purrai/theme tokens or Tailwind classes." } },
  create(ctx) {
    const HEX = /#[0-9a-fA-F]{3,8}\b/;
    return {
      Literal(node) {
        if (typeof node.value === "string" && HEX.test(node.value)) {
          ctx.report({ node, messageId: "hex", data: { value: node.value } });
        }
      },
      TemplateElement(node) {
        if (typeof node.value?.cooked === "string" && HEX.test(node.value.cooked)) {
          ctx.report({ node, messageId: "hex", data: { value: node.value.cooked } });
        }
      },
    };
  },
};

const requireSchematicOverlay = {
  meta: { type: "problem", docs: { description: "Disallow IllustrationBadge import in section files; use SchematicOverlay." }, schema: [], messages: { direct: "Import SchematicOverlay instead of IllustrationBadge directly." } },
  create(ctx) {
    return {
      ImportDeclaration(node) {
        if (!/components\/sections\//.test(ctx.getFilename())) return;
        if (node.source.value !== "@purrai/ui") return;
        for (const s of node.specifiers) {
          if (s.type === "ImportSpecifier" && s.imported.name === "IllustrationBadge") {
            ctx.report({ node: s, messageId: "direct" });
          }
        }
      },
    };
  },
};

module.exports = { rules: { "no-hex-literals": noHexLiterals, "require-schematic-overlay": requireSchematicOverlay } };
