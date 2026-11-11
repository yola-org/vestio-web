"use client"

import { ArrowIcon } from "@/components/shared/Icons"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function Manifesto() {
  const t = useTranslations()

  return (
    <section className="border-t border-black/10 bg-[#d8f05e] py-16 text-center content-padding">
      <p className="text-xs font-black tracking-[0.18em] uppercase">
        {t("home.manifesto.eyebrow")}
      </p>
      <h2 className="mx-auto mt-4 max-w-4xl text-4xl leading-[0.95] font-black tracking-[-0.05em] sm:text-6xl">
        {t("home.manifesto.title")}
      </h2>
      <Link
        href="/register"
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#151515] px-8 py-4 text-sm font-black text-white"
      >
        {t("home.manifesto.button")} <ArrowIcon className="h-5 w-5" />
      </Link>
    </section>
  )
}
