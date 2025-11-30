import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Prisma deployment on Vercel with Next.js 16
  // Ensures Prisma engine binaries are included in the deployment
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/**/*'],
    '/*': ['./node_modules/.prisma/client/**/*'],
  },
};

export default nextConfig;
