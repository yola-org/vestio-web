"use client"

import {
  CameraIcon,
  MessageIcon,
  PinIcon,
  ArrowIcon,
} from "@/components/shared/Icons"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function HowItWorks() {
  const t = useTranslations()

  const steps = [
    {
      number: "01",
      title: t("home.how.step1Title"),
      body: t("home.how.step1Body"),
      icon: <CameraIcon className="h-10 w-10" />,
      color: "bg-background",
    },
    {
      number: "02",
      title: t("home.how.step2Title"),
      body: t("home.how.step2Body"),
      icon: <MessageIcon className="h-10 w-10" />,
      color: "bg-[#e8f0fe]",
    },
    {
      number: "03",
      title: t("home.how.step3Title"),
      body: t("home.how.step3Body"),
      icon: <PinIcon className="h-10 w-10" />,
      color: "bg-[#f0fdf4]",
    },
  ]

  return (
    <section className="bg-white py-24 content-padding" id="how">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mb-20 grid gap-12 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="mb-4 inline-block text-xs font-black tracking-[0.2em] text-accent uppercase">
              {t("home.how.eyebrow")}
            </span>
            <h2 className="text-5xl leading-[0.95] font-black tracking-[-0.055em] text-primary sm:text-7xl">
              {t("home.how.titleLine1")}
              <br />
              {t("home.how.titleLine2Prefix")}{" "}
              <span className="text-deep-accent">
                {t("home.how.titleLine2Highlight")}
              </span>
              .
            </h2>
          </div>
          <div className="max-w-xl lg:ms-auto">
            <p className="text-xl leading-8 text-black/60">
              {t("home.how.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-1 border-t border-black/10 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative overflow-hidden border-b border-black/10 py-12 md:border-b-0 md:border-e md:px-10 md:first:ps-0 md:last:border-e-0"
            >
              <div className="mb-20 flex items-start justify-between">
                <span className="text-4xl font-black italic tracking-tighter text-black/5">
                  {step.number}
                </span>
                <div
                  className={`rounded-2xl ${step.color} p-5 text-deep-accent transition-transform duration-500 group-hover:scale-110`}
                >
                  {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-primary">
                {step.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-black/50">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-8 rounded-[2rem] bg-primary p-10 md:flex-row md:p-16">
          <div className="max-w-xl text-center md:text-start">
            <h4 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {t("home.how.ctaTitle")}
            </h4>
            <p className="mt-4 text-white/60">{t("home.how.ctaBody")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-3 rounded-full bg-accent px-8 py-4.5 text-sm font-bold text-white transition hover:scale-105 active:scale-95"
            >
              {t("home.how.ctaPrimary")} <ArrowIcon className="h-5 w-5" />
            </Link>
            <a
              href="#shop"
              className="rounded-full border-2 border-white/20 px-8 py-4.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {t("home.how.ctaSecondary")}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
