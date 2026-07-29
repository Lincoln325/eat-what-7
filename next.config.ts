import type { NextConfig } from "next";

// sharp is auto-externalized by Next, but on Vercel + pnpm the file tracer
// doesn't reliably follow sharp's optional native binaries, so the linux-x64
// libvips .so is missing from the deployed function and the module fails to
// load at runtime (ERR_DLOPEN_FAILED: libvips-cpp.so). Force-include the
// linux-x64 binaries for the route handlers that process images. Globs are
// version-agnostic and cover pnpm's .pnpm store layout as well as a hoisted
// node_modules/@img layout.
const SHARP_LINUX_BINARIES = [
  "./node_modules/.pnpm/**/@img/sharp-linux-x64/**/*",
  "./node_modules/.pnpm/**/@img/sharp-libvips-linux-x64/**/*",
  "./node_modules/@img/sharp-linux-x64/**/*",
  "./node_modules/@img/sharp-libvips-linux-x64/**/*",
];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/restaurants/preview": SHARP_LINUX_BINARIES,
    "/api/restaurants/confirm": SHARP_LINUX_BINARIES,
    "/api/restaurants/ingest": SHARP_LINUX_BINARIES,
    "/api/restaurants/batch": SHARP_LINUX_BINARIES,
    "/api/restaurants/[id]/refresh": SHARP_LINUX_BINARIES,
  },
};

export default nextConfig;
