"use client"

import { useTranslations } from "next-intl"

export default function Loading() {
  const t = useTranslations()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#173fdb]/10 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#173fdb] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-black/40 font-bold animate-pulse">
        {t("loading.message")}
      </p>
    </div>
  )
}
