"use client"

import { ArrowIcon } from "@/components/shared/Icons"
import { useTranslations } from "next-intl"
import Link from "next/link"
import WardrobeIllustration from "./WardrobeIllustration"

export default function Hero() {
  const t = useTranslations()

  return (
    <div className="main-container mt-3">
      <section className="isolate grid text-[#151515] md:grid-cols-2">
        <div className="min-w-0 pt-6 pb-9 sm:pb-12 lg:pb-14">
          <h1 className="text-[clamp(1.85rem,7.5vw,4.75rem)] leading-[1.03] font-black tracking-[-0.055em] md:text-[clamp(2.25rem,4.3vw,4.75rem)]">
            <span className="block">{t("home.hero.titleLine1")}</span>
            <span className="block text-[#173fdb]">
              {t("home.hero.titleLine2")}
            </span>
            <span className="block">{t("home.hero.titleLine3")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-black/65 sm:text-base">
            {t("home.hero.description")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#shop"
              className="inline-flex items-center gap-3 rounded-full bg-[#173fdb] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1233b5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173fdb]"
            >
              {t("home.hero.explore")}
              <ArrowIcon className="size-4 rtl:rotate-180" aria-hidden="true" />
            </a>
            <Link
              href="/register"
              className="rounded-full border border-black/20 px-6 py-3.5 text-sm font-bold transition-colors hover:border-[#173fdb] hover:bg-[#173fdb]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173fdb]"
            >
              {t("home.hero.emptyCloset")}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/10 pt-5 text-[10px] font-bold tracking-wider text-black/60 uppercase sm:text-xs">
            <span>{t("home.hero.fees")}</span>
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-[#173fdb]"
            />
            <span>{t("home.how.step2Title")}</span>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative mb-6 flex min-h-60 items-center justify-center md:my-6"
        >
          <div className="relative aspect-square w-full md:max-w-[520px] lg:max-w-[620px]">
            <WardrobeIllustration sizes="(min-width: 1280px) 580px, (min-width: 768px) 46.75vw, 85vw" />
          </div>
        </div>
      </section>
    </div>
  )
}
