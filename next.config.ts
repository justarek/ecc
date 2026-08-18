import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    port: "",
    pathname: "/**",
  },
];

// If S3-compatible object storage is configured for listing photo uploads
// (see src/lib/storage.ts), allow next/image to optimize images served from
// its public URL host as well.
const s3PublicBase = process.env.S3_PUBLIC_URL_BASE || process.env.S3_ENDPOINT;
if (s3PublicBase) {
  try {
    const { protocol, hostname, port } = new URL(s3PublicBase);
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      port,
      pathname: "/**",
    });
  } catch {
    // Ignore malformed S3_PUBLIC_URL_BASE/S3_ENDPOINT; local uploads still work.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default withNextIntl(nextConfig);
