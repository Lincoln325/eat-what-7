import type { NextConfig } from "next";

// sharp is auto-externalized by Next, but the file tracer doesn't reliably
// follow sharp's optional native binaries, so the linux-x64 libvips .so is
// missing from the deployed function and the module fails to load at runtime
// (ERR_DLOPEN_FAILED: libvips-cpp.so). Force-include the linux-x64 binaries
// for the route handlers that process images. These point at the hoisted
// node_modules/@img layout (node-linker=hoisted in .npmrc) — the .pnpm store
// paths are symlinks, and bundling those makes Vercel's serverless packager
// fail with "files in symlinked directories".
const SHARP_LINUX_BINARIES = [
  "./node_modules/@img/sharp-linux-x64/**/*",
  "./node_modules/@img/sharp-libvips-linux-x64/**/*",
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    // Routes that process images (import sharp). /search is deliberately NOT
    // here — it does no image processing.
    "/api/restaurants/confirm": SHARP_LINUX_BINARIES,
    "/api/restaurants/batch": SHARP_LINUX_BINARIES,
    "/api/restaurants/[id]/refresh": SHARP_LINUX_BINARIES,
  },
};

export default nextConfig;
