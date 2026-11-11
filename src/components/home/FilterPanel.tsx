"use client"
// Add all IDs that aren't already there
// Remove all IDs in the list
import { useState } from "react"
import { getCategoriesAction } from "@/lib/actions/profile"
import { useApiQuery } from "@/hooks/use-api-query"
import CategoryFilter from "./CategoryFilter"
import Skeleton from "@/components/shared/Skeleton"
import { useTranslations } from "next-intl"

import { conditions } from "@/constants/data"

export default function FilterPanel() {
  const t = useTranslations()
  const { data, loading } = useApiQuery(getCategoriesAction, {
    critical: true,
    loading: false,
  })
  const categories = data ?? []
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Unique"]

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleSelectAllCategories = (ids: string[], selected: boolean) => {
    setSelectedCategoryIds((prev) => {
      if (selected) {
        const next = [...prev]
        ids.forEach((id) => {
          if (!next.includes(id)) next.push(id)
        })
        return next
      } else {
        return prev.filter((id) => !ids.includes(id))
      }
    })
  }

  const resetFilters = () => {
    setSelectedCategoryIds([])
  }

  return (
    <aside className="w-full shrink-0 lg:w-64 space-y-8">
      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">
          {t("filters.categories")}
        </h3>
        {loading ? (
          <div className="space-y-3 px-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <CategoryFilter
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggle={handleToggleCategory}
            onSelectAll={handleSelectAllCategories}
          />
        )}
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">
          {t("filters.price", { currency: t("common.currency") })}
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder={t("filters.min")}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#173fdb]"
          />
          <span className="text-black/30">—</span>
          <input
            type="number"
            placeholder={t("filters.max")}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#173fdb]"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">
          {t("filters.size")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-bold hover:border-[#173fdb] hover:text-[#173fdb]"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black tracking-widest text-black/40 uppercase">
          {t("filters.condition")}
        </h3>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label
              key={cond}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-black/15 text-[#173fdb] focus:ring-[#173fdb]"
              />
              <span className="text-sm font-medium text-black/70 group-hover:text-[#173fdb]">
                {t(`conditions.${cond}.short`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white transition hover:bg-black/80"
      >
        {t("filters.reset")}
      </button>
    </aside>
  )
}
