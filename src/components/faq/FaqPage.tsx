"use client" /* Hero */ /* Sections */ /* CTA */
import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ChevronIcon } from "@/components/shared/Icons"

type FaqItem = {
  q: string
  a: string
}
type FaqSection = {
  title: string
  items: FaqItem[]
}

function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <ul className="divide-y divide-primary/10">
      {items.map((item, i) => (
        <li key={i}>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 py-5 text-start text-base font-semibold hover:text-accent"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.q}</span>
            <ChevronIcon
              className={`size-4 shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {open === i && (
            <p className="pb-5 text-sm leading-7 text-primary/70">{item.a}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function FaqPage() {
  const t = useTranslations("faq")

  const sections: FaqSection[] = [
    {
      title: t("sections.howItWorks.title"),
      items: [
        { q: t("sections.howItWorks.q1"), a: t("sections.howItWorks.a1") },
        { q: t("sections.howItWorks.q2"), a: t("sections.howItWorks.a2") },
        { q: t("sections.howItWorks.q3"), a: t("sections.howItWorks.a3") },
      ],
    },
    {
      title: t("sections.whatToSell.title"),
      items: [
        { q: t("sections.whatToSell.q1"), a: t("sections.whatToSell.a1") },
        { q: t("sections.whatToSell.q2"), a: t("sections.whatToSell.a2") },
        { q: t("sections.whatToSell.q3"), a: t("sections.whatToSell.a3") },
      ],
    },
    {
      title: t("sections.howToSell.title"),
      items: [
        { q: t("sections.howToSell.q1"), a: t("sections.howToSell.a1") },
        { q: t("sections.howToSell.q2"), a: t("sections.howToSell.a2") },
        { q: t("sections.howToSell.q3"), a: t("sections.howToSell.a3") },
      ],
    },
    {
      title: t("sections.contactSeller.title"),
      items: [
        {
          q: t("sections.contactSeller.q1"),
          a: t("sections.contactSeller.a1"),
        },
        {
          q: t("sections.contactSeller.q2"),
          a: t("sections.contactSeller.a2"),
        },
        {
          q: t("sections.contactSeller.q3"),
          a: t("sections.contactSeller.a3"),
        },
      ],
    },
    {
      title: t("sections.safety.title"),
      items: [
        { q: t("sections.safety.q1"), a: t("sections.safety.a1") },
        { q: t("sections.safety.q2"), a: t("sections.safety.a2") },
      ],
    },
  ]

  return (
    <>
      {}
      <section className="main-container pb-10 pt-8">
        <p className="mb-3 text-xs font-black tracking-widest text-accent uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-primary/60">
          {t("subtitle")}
        </p>
      </section>

      {}
      <section className="main-container pb-24">
        {sections.map((section) => (
          <div key={section.title} className="mb-12">
            <h2 className="mb-1 font-display text-xl font-black tracking-tight">
              {section.title}
            </h2>
            <Accordion items={section.items} />
          </div>
        ))}
      </section>

      {}
      <section className="bg-primary text-white content-padding py-16 text-center">
        <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">
          {t("cta.title")}
        </h2>
        <p className="mt-3 text-sm text-white/60">{t("cta.subtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            {t("cta.sell")}
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/50"
          >
            {t("cta.browse")}
          </Link>
        </div>
      </section>
    </>
  )
}
