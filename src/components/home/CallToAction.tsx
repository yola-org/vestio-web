"use client"

import { ArrowIcon } from "@/components/shared/Icons"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function CallToAction({
  authenticated = false,
  compact = false,
  tone = "blue",
}: {
  authenticated?: boolean
  compact?: boolean
  tone?: "blue" | "orange"
}) {
  const t = useTranslations()

  return (
    <section
      id="sell"
      className={`mx-auto grid max-w-[1440px] lg:grid-cols-2 ${
        tone === "orange"
          ? "bg-[#ff5d39] text-[#151515]"
          : "bg-[#173fdb] text-white"
      } ${compact ? "overflow-hidden rounded-2xl" : ""}`}
    >
      <div
        className={`relative overflow-hidden ${
          compact ? "min-h-[215px]" : "min-h-[430px]"
        }`}
      >
        <img
          src="https://images.unsplash.com/photo-1753219882414-4ec16b84cb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1200"
          alt={t("home.cta.imageAlt")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#ff5d39]/25 mix-blend-multiply" />
      </div>
      <div
        className={`flex flex-col justify-center ${
          compact
            ? "px-6 py-8 sm:px-8 lg:px-10"
            : "px-6 py-16 sm:px-12 lg:px-20"
        }`}
      >
        <p
          className={`font-black tracking-[0.18em] uppercase ${
            tone === "orange" ? "text-black/80" : "text-[#d8f05e]"
          } ${compact ? "mb-3 text-[10px]" : "mb-5 text-xs"}`}
        >
          {t("home.cta.eyebrow")}
        </p>
        <h2
          className={`max-w-xl font-black tracking-[-0.055em] ${
            compact
              ? "text-2xl leading-[1.05] sm:text-4xl"
              : "text-5xl leading-[0.9] sm:text-7xl"
          }`}
        >
          {t("home.cta.title")}
        </h2>
        <p
          className={`max-w-lg ${
            tone === "orange" ? "text-black/75" : "text-white/70"
          } ${compact ? "mt-4 text-sm leading-6" : "mt-7 leading-7"}`}
        >
          {t("home.cta.body")}
        </p>
        <Link
          href={authenticated ? "/listings/new" : "/register"}
          className={`flex w-fit items-center gap-3 rounded-full text-sm font-black transition hover:-translate-y-0.5 ${
            tone === "orange"
              ? "bg-[#151515] text-[#f7f3ea]"
              : "bg-[#d8f05e] text-black"
          } ${compact ? "mt-5 px-5 py-2.5" : "mt-9 px-7 py-4"}`}
        >
          {t("home.cta.button")} <ArrowIcon className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}
