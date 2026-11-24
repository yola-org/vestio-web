"use client"
// Only show root categories in the grid
import Link from "next/link"
import { categoryHref } from "@/lib/category-utils"
import React, { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowIcon, ChevronIcon } from "@/components/shared/Icons"
import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"
import { profileApi } from "@/lib/api"
import { useApiQuery } from "@/hooks/use-api-query"
import { useTranslations } from "next-intl"

const tileClass =
  "min-w-0 flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_20%] xl:flex-[0_0_15.5%]"

export default function CategoryGrid() {
  const t = useTranslations()
  const { data, loading } = useApiQuery(profileApi.getCategories, {
    critical: true,
    loading: false,
  })
  const categories = (data ?? []).filter((category) => !category.parentId)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <section
      className="main-container -mt-16 pt-6 pb-20 sm:-mt-32 sm:pt-8"
      id="shop"
    >
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <div>
          <p className="mb-2 text-xs font-black tracking-[0.16em] text-accent uppercase">
            {t("home.categories.eyebrow")}
          </p>
          <h2 className="text-4xl font-black tracking-[-0.045em] sm:text-5xl">
            {t("home.categories.title")}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            disabled={loading}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-black/5 active:scale-95"
            aria-label={t("common.previous")}
          >
            <ChevronIcon className="h-6 w-6 rotate-90" />
          </button>
          <button
            onClick={scrollNext}
            disabled={loading}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-black/5 active:scale-95"
            aria-label={t("common.next")}
          >
            <ChevronIcon className="h-6 w-6 -rotate-90" />
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGroup className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={tileClass}>
              <Skeleton className="aspect-[4/5] rounded-t-[6rem]" />
              <div className="border-b border-black/20 py-4">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </SkeletonGroup>
      ) : (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {categories.map((category) => (
              <div key={category.id} className={tileClass}>
                <Link
                  href={categoryHref(category.name)}
                  className="group block"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-t-[6rem] bg-gray-200">
                    {category.image && (
                      <img
                        src={category.image}
                        alt=""
                        className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between border-b border-black/20 py-4">
                    <span className="font-bold">{category.name}</span>
                    <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
