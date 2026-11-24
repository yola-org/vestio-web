"use client"

import { useEffect } from "react"
import FriendlyError from "@/components/shared/FriendlyError"
import { logger } from "@/lib/logger"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    logger.error("ERROR_BOUNDARY", error, { digest: error.digest })
  }, [error])

  return <FriendlyError onRetry={retry} />
}
