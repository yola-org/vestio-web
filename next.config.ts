import createNextIntlPlugin from "next-intl/plugin"

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  logging: {
    incomingRequests: false,
  },
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

export default withNextIntl({})
