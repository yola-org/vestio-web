"use client"

import Spinner from "@/components/shared/Spinner"
import { useTranslations } from "next-intl"

export default function Loading() {
  const t = useTranslations()

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-deep-accent">
      <Spinner className="size-12 border-4" label={t("loading.message")} />
    </div>
  )
}
