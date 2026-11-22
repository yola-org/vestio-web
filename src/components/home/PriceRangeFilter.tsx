"use client"
// The upper end represents no price limit; expand it for saved filters.
import { useState } from "react"
import * as Slider from "@radix-ui/react-slider"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { localeDirection, type Locale } from "@/i18n/config"

function price(value?: string) {
  if (!value?.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
}: {
  minPrice?: string
  maxPrice?: string
}) {
  const t = useTranslations()
  const format = useFormatter()
  const locale = useLocale() as Locale
  const initialMin = price(minPrice) ?? 0
  const initialMax = price(maxPrice)
  const ceiling =
    Math.ceil(Math.max(5000, initialMin + 1000, initialMax ?? 0) / 1000) * 1000
  const [values, setValues] = useState([
    initialMin,
    Math.max(initialMin, initialMax ?? ceiling),
  ])
  const [unlimited, setUnlimited] = useState(initialMax === undefined)
  const amount = (value: number) =>
    `${format.number(value)} ${t("common.currency")}`
  const maximum = unlimited ? t("filters.noPriceLimit") : amount(values[1])

  return (
    <fieldset className="min-w-0 border-b border-primary/8 py-5">
      <legend className="float-start mb-3 w-full text-sm font-bold">
        {t("filters.price", { currency: t("common.currency") })}
      </legend>
      <input
        type="hidden"
        name="minPrice"
        value={values[0] === 0 ? "" : values[0]}
      />
      <input type="hidden" name="maxPrice" value={unlimited ? "" : values[1]} />
      <div className="clear-both flex justify-between gap-3 text-sm">
        <div>
          <span className="block text-xs text-primary/55">
            {t("filters.min")}
          </span>
          <output className="mt-1 block font-semibold tabular-nums">
            {amount(values[0])}
          </output>
        </div>
        <div className="text-end">
          <span className="block text-xs text-primary/55">
            {t("filters.max")}
          </span>
          <output className="mt-1 block font-semibold tabular-nums">
            {maximum}
          </output>
        </div>
      </div>
      <Slider.Root
        data-price-slider
        dir={localeDirection(locale)}
        min={0}
        max={ceiling}
        step={1}
        minStepsBetweenThumbs={0}
        preserveThumbOrder
        value={values}
        onValueChange={(next) => {
          if (next[1] !== values[1]) setUnlimited(next[1] === ceiling)
          setValues(next)
        }}
        className="relative mt-2 flex h-11 w-full touch-none select-none items-center"
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-primary/12">
          <Slider.Range className="absolute h-full rounded-full bg-deep-accent" />
        </Slider.Track>
        <Slider.Thumb
          aria-label={t("filters.min")}
          aria-valuetext={amount(values[0])}
          className="block size-6 cursor-grab rounded-full border-2 border-deep-accent bg-white shadow-sm outline-none transition-shadow hover:ring-4 hover:ring-deep-accent/10 focus-visible:ring-4 focus-visible:ring-deep-accent/20 active:cursor-grabbing"
        />
        <Slider.Thumb
          aria-label={t("filters.max")}
          aria-valuetext={maximum}
          className="block size-6 cursor-grab rounded-full border-2 border-deep-accent bg-white shadow-sm outline-none transition-shadow hover:ring-4 hover:ring-deep-accent/10 focus-visible:ring-4 focus-visible:ring-deep-accent/20 active:cursor-grabbing"
        />
      </Slider.Root>
      <div
        aria-hidden="true"
        className="flex justify-between text-[11px] text-primary/45"
      >
        <span>{format.number(0)}</span>
        <span>{format.number(ceiling)}+</span>
      </div>
    </fieldset>
  )
}
