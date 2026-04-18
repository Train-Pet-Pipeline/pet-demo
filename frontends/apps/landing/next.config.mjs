import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

export default withNextIntl({
  transpilePackages: ["@purrai/ui", "@purrai/theme"],
  images: { unoptimized: false },
});
