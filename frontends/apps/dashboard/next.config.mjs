const offline = !!process.env.OFFLINE_BUNDLE;
export default {
  output: offline ? "export" : undefined,
  images: { unoptimized: offline },
  trailingSlash: offline,
  transpilePackages: ["@purrai/ui", "@purrai/theme"],
  env: { NEXT_PUBLIC_OFFLINE_BUNDLE: offline ? "1" : "0" },
};
