import type { NextConfig } from "next";

/* Vercel preview deployments inject the vercel.live toolbar;
   allow it there only — production keeps the tight policy. */
const isPreview = process.env.VERCEL_ENV === "preview";
const live = (sources: string) => (isPreview ? ` ${sources}` : "");

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${live("https://vercel.live")}`,
  `style-src 'self' 'unsafe-inline'${live("https://vercel.live")}`,
  `img-src 'self' data: https://placehold.co${live("blob: https://vercel.live https://vercel.com")}`,
  `font-src 'self'${live("https://vercel.live https://assets.vercel.com")}`,
  `connect-src 'self'${live("https://vercel.live wss://*.pusher.com")}`,
  `frame-src 'self'${live("https://vercel.live")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
