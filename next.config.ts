import createNextIntlPlugin from "next-intl/plugin"

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "51mb" },
  },
  logging: {
    incomingRequests: false,
  },
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

export default withNextIntl(nextConfig)
